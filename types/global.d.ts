
type DecoderID = string;

// 
type IDecoderPermission = string[] | undefined;

type wasMain = boolean;

type IDecoderShortcuts = string[] | undefined;

type IDecoderConfig = [
  wasMain,
  IDecoderPermission,
  IDecoderShortcuts
]

type IDecoders = [
  DecoderID,
  IDecoderConfig
]

/**
 * Global state
 */
interface IGlobalState {
  decoders: IDecoders[],
  config: {

  }
}

module globalThis {

  type ENVNames = "chromeos" | "vscode" | "web";

  declare var IMEConfig: {
    /** Runtime env name. */
    envName: ENVNames,

    menuItems: any[],
    
    /** Runtime api adapter. */
    ime: chrome.input.ime,
    runtime: chrome.runtime,

    getGlobalState: () => Promise<IGlobalState | undefined>,
    saveGlobalState: (states: IGlobalState) => Promise<boolean>,
    
    onInstalled?: () => boolean,
  }
}