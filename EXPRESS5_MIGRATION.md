# Express 5 Migration Notes

> **Status:** Assessment complete. Migration is **safe** — only one breaking
> change affects this codebase. Deferred until the team confirms timing.

## Current State

- **Express version**: 4.22.2 (latest 4.x)
- **Express 5**: 5.1.0 (stable, released 2024)

## Breaking Changes That Affect This Codebase

### 1. Wildcard route syntax (BREAKING — must change)

Express 5 uses `path-to-regexp` v8, which changed the wildcard syntax.

```ts
// Express 4 (current — server.ts line 486)
app.get("*", (req, res) => { ... });

// Express 5 (required)
app.get("*splat", (req, res) => { ... });
// OR use a named param:
app.get("/{*splat}", (req, res) => { ... });
```

**Impact**: 1 line in `server.ts`. The S-07 fix (wildcard catch-all that
excludes `/api/*`) needs the `*splat` syntax.

### 2. `res.json()` caching (non-breaking)

`res.json()` no longer sets `Cache-Control` by default. We don't rely on
this — no change needed.

### 3. Removed deprecated methods (non-breaking)

`res.sendfile`, `req.param`, `app.del` are removed. We don't use any of
these — `grep` confirms zero usages.

### 4. `req.query` is now a plain object (non-breaking)

In Express 4, `req.query` could be a string or parsed object depending on
the query parser. In Express 5, it's always a plain object. We don't read
`req.query` anywhere — no change needed.

## Migration Steps

1. `npm install express@5 --legacy-peer-deps`
2. Update `server.ts` line 486: `app.get("*", ...)` → `app.get("*splat", ...)`
3. Update the path check: `req.path.startsWith("/api/")` still works (path
   is unaffected by the route syntax change)
4. Run the server integration tests: `npx vitest run src/test/server.integration.test.ts`
5. Run the E2E tests: `npx playwright test`
6. Verify the SPA fallback still serves `index.html` for non-API routes

## Risk Assessment

- **Low risk**: 1 line change, well-tested by 7 integration tests + 6 E2E tests
- **Rollback**: `npm install express@4` + revert the wildcard line
- **Benefits**: async middleware support (better error handling for the
  Gemini call), streaming response support, active maintenance

## Recommendation

Migrate when convenient — it's a 5-minute change with full test coverage.
Not urgent because Express 4 is still receiving security patches.
