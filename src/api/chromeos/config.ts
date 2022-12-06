import { getGlobalState, saveGlobalState } from "./states";

export default function setChromeOSConfig() {
  globalThis.IMEConfig = {
    envName: "chromeos",
    ime: chrome.input.ime,
    runtime: chrome.runtime,
    getGlobalState,
    saveGlobalState,
    
    onInstalled() {
      return true;
    }
  } 
}