
/** Fetch the local json file. */
export function fetchLocalJson(fileName: string) {
  let fetchUrl = chrome.runtime.getURL(`data/${fileName}.json`);
  
  return fetch(fetchUrl).then(res => res.json());
}