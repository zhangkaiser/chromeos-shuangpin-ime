import { getGlobalState, saveGlobalState } from "./states";

export default function setChromeOSConfig() {
  globalThis.IMEConfig = {
    envName: "chromeos",
    menuItems: [],
    ime: chrome.input.ime,
    runtime: chrome.runtime,
    getGlobalState,
    saveGlobalState,
    
    onInstalled() {
      chrome.runtime.openOptionsPage(console.log);
      return true;
    }
  } 
}