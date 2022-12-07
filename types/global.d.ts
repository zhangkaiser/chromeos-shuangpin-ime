
/**
 * Global state
 */
interface IGlobalState {
  
}

module globalThis {

  type ENVNames = "chromeos" | "vscode" | "web";

  declare var IMEConfig: {
    /** Runtime env name. */
    envName: ENVNames,
    
    /** Runtime api adapter. */
    ime: chrome.input.ime,
    runtime: chrome.runtime,

    getGlobalState: () => Promise<IGlobalState>,
    saveGlobalState: (states: IGlobalState) => Promise<boolean>,
    
    onInstalled?: () => boolean,
  }
}