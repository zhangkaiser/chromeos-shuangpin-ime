import { BaseEventManager } from "./base";
import { imeConfig } from "./setglobalconfig";

type InputIMEApiKeysType = keyof typeof chrome.input.ime;

const imeEventList = [
  "onActivate",
  "onAssistiveWindowButtonClicked",
  "onBlur",
  "onCandidateClicked",
  "onDeactivated",
  "onFocus",
  "onInputContextUpdate",
  "onKeyEvent",
  "onMenuItemActivated",
  "onReset",
  "onSurroundingTextChanged"
]


export class IMELifecycle extends BaseEventManager implements Partial<Record<InputIMEApiKeysType, Function>> {
  [key: string]: any;

  constructor() {
    super();
    

    imeEventList.forEach((item) => {

      if (Reflect.has(this, item)) return;

      this[item] = (...args: any[]) => {
        this.handleEvent(item, args);
      }
    })
  }

  handleEvent(eventName: string, args: any[]) {
    
  }

  registerListeners() { 
    this.addListeners(imeConfig.ime, imeEventList, this);
  }

  onActivate(engineID: string) {

  }

  onAssistiveWindowButtonClicked(
    details: chrome.input.ime.AssistiveWindowButtonClickedDetails
  ) {
    
  }

  onBlur(contextID: number) {

  }

  onCandidateClicked(engineID: string, candidatesID: number, button: MouseButton) {

  }

  onDeactivated(engineID: string) {

  }

  onFocus(context: chrome.input.ime.InputContext) {

  }

  onInputContextUpdate(context: chrome.input.ime.InputContext) {

  }

  onKeyEvent(engineID: string, keyData: KeyboardEvent, requestId: string) {

  }

  onMenuItemActivated(engineID: string, name: string) {

  }

  onReset(engineID: string) {

  }

  onSurroundingTextChanged(engineID: string, surroundingInfo: chrome.input.ime.SurroundingTextInfo) {

  }

}

export class DecoderLifecycle {
  
  onActivate(engineID: string) {

  }

  onAssistiveWindowButtonClicked(
    details: chrome.input.ime.AssistiveWindowButtonClickedDetails
  ) {
    
  }

  onBlur(contextID: number) {

  }

  onCandidateClicked(engineID: string, candidatesID: number, button: MouseButton) {

  }

  onDeactivated(engineID: string) {

  }

  onFocus(context: chrome.input.ime.InputContext) {

  }

  onInputContextUpdate(context: chrome.input.ime.InputContext) {

  }

  onKeyEvent(engineID: string, keyData: KeyboardEvent, requestId: string) {

  }

  onMenuItemActivated(engineID: string, name: string) {

  }

  onReset(engineID: string) {

  }

  onSurroundingTextChanged(engineID: string, surroundingInfo: chrome.input.ime.SurroundingTextInfo) {

  }
}