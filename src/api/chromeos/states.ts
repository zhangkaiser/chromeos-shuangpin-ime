
const STORAGE_KEY = "global_state";

let states = {

}

export function getGlobalState(): Promise<IGlobalState> {

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(STORAGE_KEY, (res) => {
      if (STORAGE_KEY in res) {
        resolve(res[STORAGE_KEY]);
      } else {
        resolve({});
      }
    })
  });

}

export function saveGlobalState(states: IGlobalState): Promise<boolean> {
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({
      [STORAGE_KEY]: states
    }, () => {
      resolve(true);
    });
  });

}
