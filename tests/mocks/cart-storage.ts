/**
 * In-memory `Storage` stub. Used to give the Zustand `persist`
 * middleware (which reads / writes `window.localStorage`) a clean,
 * deterministic surface in jsdom.
 *
 * Each test that exercises the cart store should call
 * `installCartStorageStub()` inside `beforeEach` and read via
 * `getStorageStub().store` to assert against the persisted shape.
 *
 * Why a hand-rolled stub rather than letting jsdom's localStorage
 * leak: jsdom shares its storage instance across files-in-the-same-
 * environment, which means a stale entry from a previous test could
 * rehydrate the cart store unpredictably. The stub gives us a
 * per-test cold start.
 */

interface StorageStub extends Storage {
  store: Map<string, string>;
}

function createStub(): StorageStub {
  const store = new Map<string, string>();
  const stub = {
    store,
    get length() {
      return store.size;
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string): string | null {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    clear(): void {
      store.clear();
    },
  } satisfies StorageStub;
  return stub;
}

let active: StorageStub | null = null;

export function installCartStorageStub(): StorageStub {
  active = createStub();
  Object.defineProperty(globalThis, 'localStorage', {
    value: active,
    configurable: true,
    writable: true,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: active,
      configurable: true,
      writable: true,
    });
  }
  return active;
}

export function getStorageStub(): StorageStub {
  if (!active) throw new Error('Call installCartStorageStub() in beforeEach');
  return active;
}
