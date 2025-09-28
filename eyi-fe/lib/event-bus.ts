// Simple client-side event bus for cross-hook notifications
// Avoids adding a full dependency; only used in the browser.

type EnsUpdate = { name: string; key?: string };

const listeners = new Set<(u: EnsUpdate) => void>();

export function onEnsRecordsUpdated(listener: (u: EnsUpdate) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitEnsRecordsUpdated(update: EnsUpdate) {
  listeners.forEach((fn) => {
    try {
      fn(update);
    } catch (e) {
      console.error('ENS event listener error', e);
    }
  });
}

