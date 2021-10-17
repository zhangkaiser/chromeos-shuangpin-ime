
let debug = false;

export function debugLog(...args: any[]) {
  if (debug) {
    console.log(...args);
  }
}

export function enableDebug() {
  debug = true;
}