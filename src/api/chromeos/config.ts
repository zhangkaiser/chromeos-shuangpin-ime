export function getGlobalState() {
  return Promise.resolve({});
}

export default function setChromeOSConfig() {
  globalThis.IMEConfig = {
    envName: "chromeos",
    ime: chrome.input.ime,
    runtime: chrome.runtime,
    getGlobalState
  } 
}