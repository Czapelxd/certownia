// Persist a pending verification in localStorage so the user can close the tab
// and return to the SAME challenge (same DNS/HTTP value) instead of generating
// fresh data. Cleared on success or an explicit fresh start.
//
// What's stored: the config, the ACME account key (JWK), the order + its URL,
// and the derived challenges. The account key is not the certificate key and is
// never transmitted; the certificate key is never persisted.

import type { AcmeEnv, AcmeOrder, ChallengeInstruction, ChallengeType } from "./acme.js";
import type { CertKeyType } from "./crypto.js";

const KEY = "certownia.session.v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // Let's Encrypt orders live ~7 days

export interface PersistedConfig {
  domains: string[];
  email: string;
  env: AcmeEnv;
  keyType: CertKeyType;
  challenge: ChallengeType;
}

export interface PersistedSession {
  savedAt: number;
  config: PersistedConfig;
  accountKeyJwk: JsonWebKey;
  order: AcmeOrder;
  orderUrl: string;
  challenges: ChallengeInstruction[];
  recordChanged?: boolean; // survives reload so the "value changed" banner persists
  orderDead?: boolean; // set after a failed verify → resume makes a fresh order
}

export function saveSession(s: Omit<PersistedSession, "savedAt">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, savedAt: Date.now() }));
  } catch {
    /* storage disabled or full — persistence is best-effort */
  }
}

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as PersistedSession;
    const fresh = s?.savedAt && Date.now() - s.savedAt <= MAX_AGE_MS;
    if (!fresh || !s.config?.domains?.length || !s.challenges?.length || !s.orderUrl) {
      clearSession();
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Flag the stored order as dead (a failed verify) so resume issues a fresh one. */
export function markSessionDead(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const s = JSON.parse(raw) as PersistedSession;
    s.orderDead = true;
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
