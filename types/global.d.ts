
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

type IMEMethodInterface = Omit<typeof chrome.input.ime, 
"onActivate" | "onAssistiveWindowButtonClicked" | "onBlur" |
"onCandidateClicked" | "onDeactivated" | "onFocus"| "onInputContextUpdate" | 
"onReset" | "onSurroundingTextChanged" | "onKeyEvent" | "onMenuItemActivated">;

interface IApiController extends IMEMethodInterface {
  port?: chrome.runtime.Port
}

module globalThis {
  var imeAPI: IApiController;
}