/**
 * lib/fileCounter.ts
 *
 * Browser-side helper that:
 * 1. Increments a localStorage counter (keeps the per-device running total).
 * 2. POSTs to /api/counter to increment the persistent global counter.
 *
 * Call `incrementFileCount()` in every tool's success handler.
 */

const LS_KEY = 'pf_files_processed';

/** Increment both the local and global counter. */
export async function incrementFileCount(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1 ── Local (instant, offline-safe)
  const current = parseInt(localStorage.getItem(LS_KEY) ?? '0', 10);
  localStorage.setItem(LS_KEY, String(current + 1));

  // 2 ── Global (best-effort — don't block or throw)
  try {
    await fetch('/api/counter', { method: 'POST' });
  } catch {
    // network unavailable — local counter already updated, that's fine
  }
}

/** Return the local device counter (used as a fallback). */
export function getLocalFileCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(LS_KEY) ?? '0', 10);
}
