import { BaseEventManager } from "./base";
import { IMEEventDispatcher } from "./eventdispatcher";
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

const imeMethodList = [
  "clearComposition",
  "commitText",
  "deleteSurroundingText",
  "hideInputView",
  "keyEventHandled",
  "sendKeyEvents",
  "setAssistiveWindowButtonHighlighted",
  "setAssistiveWindowProperties",
  "setCandidates",
  "setCandidateWindowProperties",
  "setComposition",
  "setCursorPosition",
  "setMenuItems",
  "updateMenuItems"
]


export class IMELifecycle extends BaseEventManager {
  [key: string]: any;

  _engineID?: string;

  eventDispatcher?: IMEEventDispatcher;

  constructor() {
    super();
    
    imeEventList.forEach((item) => {

      if (Reflect.has(this, item)) return;

      this[item] = (...args: any[]) => {
        this.dispatchIMEEvent(item, args);
      }
    });

    imeMethodList.forEach((item) => {
      if (Reflect.has(this, item)) return;
      if (!Reflect.has(imeConfig.ime, item)) return;
      this[item] = (...args: any[]) => {
        imeConfig.ime[item](...args);
      }
    })
  }

  dispatchIMEEvent(eventName: string, args: any[]) {
    this.eventDispatcher?.dispatch(eventName as MessageType, args);
  }

  handleIMEEvent(eventName: string, args: any[]) {
    if (eventName in this) {
      this[eventName](...args);
      return true;
    }
    return false;
  }

  registerListeners() { 
    this.addListeners(imeConfig.ime, imeEventList, this);
  }

  onActivate(engineID: string) {
    this._engineID = engineID;
    this.eventDispatcher?.connects();

    this.dispatchIMEEvent("onActivate", [engineID]);
  }

  onFocus(context: chrome.input.ime.InputContext) {
    this._contextID = context.contextID;
    this.dispatchIMEEvent("onFocus", [context]);
  }

  onDeactivated() {
    this.eventDispatcher?.disposes();
  }

  onKeyEvent(engineID: string, keyEvent: KeyboardEvent, requestId: string) {
    // Quick 
    this.dispatchIMEEvent("onKeyEvent", [engineID, keyEvent, requestId]);
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