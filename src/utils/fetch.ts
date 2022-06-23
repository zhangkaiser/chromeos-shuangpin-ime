
/** Fetch the local json file. */
export function fetchLocalJson(fileName: string) {
  let fetchUrl = chrome.runtime.getURL(`data/${fileName}.json`);
  
  return fetch(fetchUrl).then(res => res.json());
<<<<<<< HEAD
}

export interface FetchReturnType {
  promise: Promise<Response>,
  signal: AbortSignal,
  abort: Function
}


/** Fetch the request and can abort it.  */
export function fetchApi(url: string, params: object) {

  let controller = new AbortController();
  let signal = controller.signal;
  
  const promise = fetch(url, { ...params, signal });

  return {
    promise,
    signal,
    abort: () => {
      controller.abort()
    },
  }
}

/** @todo Need to improve. */
export class Fetch {
  /** The HTTP GET request method. */
  static get(
    url: string, 
    init?: any) {
    return fetchApi(url, init);
  }

  /** The HTTP POST request method. */
  static post(
    url: string,
    init: any
  ) {
    return fetchApi(url, {...init, method: 'POST'})
  }
=======
>>>>>>> sync-wasm-decoder
}