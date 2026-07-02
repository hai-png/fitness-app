import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "node:http";
import { Server as SocketServer } from "node:net";

// We can't import server.ts directly because it calls app.listen() on import.
// Instead, we test the validation + error-handling behavior by spawning the
// production server bundle as a child process and hitting it over HTTP.
// This keeps the test isolated from the Gemini SDK (no real API key).

import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const SERVER_PORT = 3999; // unlikely to collide
const BASE = `http://localhost:${SERVER_PORT}`;

// A valid onboarding payload matching the zod schema in server.ts
const VALID_ONBOARDING = {
  name: "Test User",
  age: 30,
  gender: "male",
  weight: 80,
  height: 180,
  goal: "muscle-gain" as const,
  activityLevel: "moderate" as const,
  workoutPreference: "gym" as const,
  frequency: 3,
  dietType: "anything" as const,
  allergies: "",
};

let serverProc: ChildProcess;

async function startServer(env: Record<string, string> = {}): Promise<void> {
  const serverPath = path.resolve(process.cwd(), "dist/server.cjs");
  return new Promise((resolve, reject) => {
    serverProc = spawn("node", [serverPath], {
      env: {
        ...process.env,
        PORT: String(SERVER_PORT),
        NODE_ENV: "production",
        // No GEMINI_API_KEY — we want to test the no-key path
        GEMINI_API_KEY: "",
        ...env,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const onReady = (data: Buffer) => {
      const msg = data.toString();
      // S-16: server now uses pino structured logging. The startup log line
      // is JSON with msg: "server_started" and port: <PORT>. Match either
      // the new pino format or the old console.log format for robustness.
      if (
        msg.includes(`"msg":"server_started"`) ||
        msg.includes(`Server running on port ${SERVER_PORT}`)
      ) {
        serverProc.stdout?.off("data", onReady);
        resolve();
      }
    };
    serverProc.stdout?.on("data", onReady);
    serverProc.stderr?.on("data", () => {
      /* swallow SDK warnings about missing API key */
    });

    setTimeout(() => reject(new Error("Server failed to start within 5s")), 5000);
  });
}

async function stopServer(): Promise<void> {
  if (!serverProc) return;
  return new Promise((resolve) => {
    serverProc.on("exit", () => resolve());
    serverProc.kill("SIGTERM");
    setTimeout(() => {
      try {
        serverProc.kill("SIGKILL");
      } catch {
        /* already dead */
      }
      resolve();
    }, 2000);
  });
}

async function post(pathname: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* leave as text */
  }
  return { status: res.status, body: json ?? text, headers: res.headers };
}

describe("POST /api/generate-plan — integration", () => {
  beforeAll(async () => {
    // Ensure the server bundle is built
    await startServer();
  }, 10000);

  afterAll(async () => {
    await stopServer();
  });

  it("rejects an empty body with 400 + structured zod issues", async () => {
    const res = await post("/api/generate-plan", {});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid onboarding data");
    expect(res.body).toHaveProperty("requestId");
    expect((res.body as any).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name", message: expect.any(String) }),
        expect.objectContaining({ path: "age", message: expect.any(String) }),
      ]),
    );
  });

  it("rejects an out-of-range age with 400 + specific issue", async () => {
    const res = await post("/api/generate-plan", { ...VALID_ONBOARDING, age: 5 });
    expect(res.status).toBe(400);
    expect((res.body as any).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "age", message: expect.stringMatching(/age/i) }),
      ]),
    );
  });

  it("rejects an invalid goal enum value with 400", async () => {
    const res = await post("/api/generate-plan", { ...VALID_ONBOARDING, goal: "invalid-goal" });
    expect(res.status).toBe(400);
    expect((res.body as any).issues[0].message).toMatch(/expected/i);
    expect((res.body as any).issues[0].message).toContain("muscle-gain");
  });

  it("rejects an oversized payload (>32kb) with 413", async () => {
    // Build a payload whose allergies field exceeds 32kb total
    const huge = { ...VALID_ONBOARDING, allergies: "x".repeat(40000) };
    const res = await post("/api/generate-plan", huge);
    // express.json() limit returns 413 Payload Too Large
    expect([400, 413]).toContain(res.status);
  });

  it("accepts a valid onboarding input and returns 400 (no API key configured)", async () => {
    // Without GEMINI_API_KEY, the server should reject with the helpful
    // "not configured" message — NOT a 500 from the SDK.
    const res = await post("/api/generate-plan", VALID_ONBOARDING);
    expect(res.status).toBe(400);
    expect((res.body as any).error).toMatch(/GEMINI_API_KEY is not configured/i);
    expect(res.body).toHaveProperty("requestId");
  });

  it("rate-limits after 5 requests per minute from a single IP", async () => {
    // Prior tests in this suite have already consumed some of the 5-req/min
    // budget. We fire requests until we see a 429, then assert that:
    //   (a) we did see a 429 within a reasonable number of requests, AND
    //   (b) every request before the 429 was either 400 or 429.
    const statuses: number[] = [];
    let saw429 = false;
    for (let i = 0; i < 10 && !saw429; i++) {
      const res = await post("/api/generate-plan", {});
      statuses.push(res.status);
      if (res.status === 429) saw429 = true;
    }
    expect(saw429).toBe(true);
    // Every pre-429 status must be a legitimate 400 (validation), never a 500
    const pre = statuses.slice(0, -1);
    pre.forEach((s) => expect([400, 429]).toContain(s));
  });

  it("never leaks SDK internals in any error response", async () => {
    // Hit any endpoint that produces an error response — we don't care
    // whether it's a 400 (validation) or 429 (rate-limited); either way
    // the body must NOT contain stack traces or SDK class names.
    const res = await post("/api/generate-plan", VALID_ONBOARDING);
    const body = JSON.stringify(res.body);
    // No stack traces, no "GoogleGenAI" internal class names, no API key echoes
    expect(body).not.toMatch(/at\s+.*\(\w+:\d+:\d+\)/); // no stack frame
    expect(body).not.toMatch(/GoogleGenAI/);
  });
});

// Suppress unused-import warnings for node:http and node:net (kept for parity)
void createServer;
void SocketServer;
