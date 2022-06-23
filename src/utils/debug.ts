

const LOG_STORAGE_KEY = 'ime_log_storage';

/** The global status for debug. */
let debug = false;

/** Log data retention.  */
export function storageLog(...args: any[]) {
  chrome.storage.local.get(LOG_STORAGE_KEY, (res) => {
    let data = [];
    args.push(new Date().toUTCString());
    if (res[LOG_STORAGE_KEY]) {
      data = res[LOG_STORAGE_KEY];
      data.push(args);
    } else {
      data.push(args);
    }

    chrome.storage.local.set({ [LOG_STORAGE_KEY]: data });
  })
}

export function debugLog(...args: any[]) {
  if (debug) {
    console.log(...args);
  }
}

export function enableDebug() {
  debug = true;
}