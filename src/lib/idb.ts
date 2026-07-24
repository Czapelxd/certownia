// A tiny IndexedDB store holding the ACME account key across a page reload.
//
// Why IndexedDB and not localStorage: WebCrypto CryptoKey objects — including
// NON-EXTRACTABLE ones — survive the structured-clone that IndexedDB uses, so
// the account key can be persisted and later used to sign WITHOUT its raw key
// material ever being readable by JavaScript. An XSS or a malicious extension
// can, at most, *use* the key while the page is open; it cannot read it out of
// storage the way it could an extractable JWK sitting in localStorage.

const DB_NAME = "certownia";
const STORE = "keys";
const ACCOUNT_KEY = "account";

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  // If IndexedDB is unavailable (e.g. a non-browser test env, or blocked), the
  // access below throws and this rejects — callers treat persistence as
  // best-effort and simply skip resume.
  return new Promise<T>((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onblocked = () => reject(new Error("IndexedDB open blocked"));
    open.onsuccess = () => {
      const db = open.result;
      // transaction()/objectStore()/run() can throw synchronously (absent store,
      // Safari private-mode quirks, DataCloneError). This runs in a later task,
      // so a throw here would escape and leave the promise hanging forever —
      // wrap it so those failures reject and callers still degrade to no-resume.
      try {
        const req = run(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => {
          resolve(req.result);
          db.close();
        };
        req.onerror = () => {
          reject(req.error);
          db.close();
        };
      } catch (err) {
        reject(err);
        db.close();
      }
    };
  });
}

/** Persist the ACME account key pair (kept as a live, non-extractable CryptoKey). */
export function putAccountKey(pair: CryptoKeyPair): Promise<IDBValidKey> {
  return withStore("readwrite", (s) => s.put(pair, ACCOUNT_KEY));
}

/** Load the persisted account key pair, or undefined if none is stored. */
export function getAccountKey(): Promise<CryptoKeyPair | undefined> {
  return withStore(
    "readonly",
    (s) => s.get(ACCOUNT_KEY) as IDBRequest<CryptoKeyPair | undefined>,
  );
}

/** Remove the persisted account key (called when a session ends or is discarded). */
export function deleteAccountKey(): Promise<undefined> {
  return withStore("readwrite", (s) => s.delete(ACCOUNT_KEY) as IDBRequest<undefined>);
}
