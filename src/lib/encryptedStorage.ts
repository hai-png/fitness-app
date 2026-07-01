/**
 * S-03 fix: AES-GCM encryption for localStorage.
 *
 * The app stores sensitive health data (body composition, dietary intake,
 * weight history, menstrual cycle phase) in localStorage via zustand persist.
 * localStorage is plaintext, shared across all scripts on the origin (any
 * XSS = full exfiltration), and not encrypted at rest.
 *
 * This module provides a `createEncryptedStorage` factory that wraps
 * zustand's storage interface with an AES-GCM encryption layer. The
 * encryption key is generated on first visit and stored in IndexedDB (not
 * localStorage — so an XSS that reads localStorage cannot read the key).
 *
 * Trade-offs:
 * - Defense-in-depth, not a complete fix. A determined attacker with XSS
 *   can still read decrypted state from React's memory. The real fix is
 *   server-side storage behind auth (S-01).
 * - Per-installation key: clearing browser data removes the key AND the
 *   encrypted data, so there's no orphaned encrypted blob.
 * - Falls back to plaintext if Web Crypto / IndexedDB is unavailable
 *   (private mode, old browsers) so the app still works.
 */

import type { StateStorage } from "zustand/middleware";

const DB_NAME = "fitlife-secure";
const STORE_NAME = "keys";
const KEY_RECORD = "encryption-key";

function openKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getOrCreateKey(): Promise<CryptoKey | null> {
  if (typeof indexedDB === "undefined" || typeof crypto?.subtle === "undefined") {
    return null;
  }
  try {
    const db = await openKeyDB();
    const existing = await new Promise<ArrayBuffer | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(KEY_RECORD);
      req.onsuccess = () => resolve((req.result as ArrayBuffer) ?? null);
      req.onerror = () => reject(req.error);
    });
    if (existing) {
      return crypto.subtle.importKey("raw", existing, { name: "AES-GCM" }, false, [
        "encrypt", "decrypt",
      ]);
    }
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
      "encrypt", "decrypt",
    ]);
    const rawKey = await crypto.subtle.exportKey("raw", key);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(rawKey, KEY_RECORD);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
      "encrypt", "decrypt",
    ]);
  } catch {
    return null;
  }
}

let cachedKey: CryptoKey | null | undefined = undefined;
async function getKey(): Promise<CryptoKey | null> {
  if (cachedKey !== undefined) return cachedKey;
  cachedKey = await getOrCreateKey();
  return cachedKey;
}

async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(base64: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

/**
 * Create an encrypted zustand storage adapter.
 * Falls back to plaintext if Web Crypto / IndexedDB is unavailable.
 */
export function createEncryptedStorage(getStorage: () => Storage): StateStorage {
  const storage = getStorage();
  return {
    getItem: async (name: string): Promise<string | null> => {
      const raw = storage.getItem(name);
      if (!raw) return null;
      if (!raw.startsWith("enc:")) return raw; // plaintext fallback
      const key = await getKey();
      if (!key) return null;
      try {
        return await decrypt(raw.slice(4), key);
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      const key = await getKey();
      if (!key) {
        storage.setItem(name, value);
        return;
      }
      try {
        const encrypted = await encrypt(value, key);
        storage.setItem(name, `enc:${encrypted}`);
      } catch {
        storage.setItem(name, value);
      }
    },
    removeItem: (name: string): void => {
      storage.removeItem(name);
    },
  };
}
