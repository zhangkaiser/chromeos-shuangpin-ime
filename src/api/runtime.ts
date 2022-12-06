import { BaseEventManager } from "./base";
import { imeConfig } from "./setglobalconfig";

type RuntimeApiKeysType = keyof typeof chrome.runtime;

export const runtimeEventList:RuntimeApiKeysType[] = [
  "onConnect",
  "onConnectExternal",
  "onInstalled",
  "onMessage",
  "onMessageExternal",
  "onBrowserUpdateAvailable",
  "onRestartRequired",
  "onStartup",
  "onSuspend",
  "onSuspendCanceled",
  "onUpdateAvailable"
]

class BaseRuntimeManager extends BaseEventManager {

  constructor() {
    super();
  }

  registerListeners() {
    this.addListeners(imeConfig.runtime, runtimeEventList, this);
  }

}


export class UIRuntimeManager extends BaseRuntimeManager {
  constructor() {
    super();
  }

  onInstalled() { 
    if (imeConfig.onInstalled) {
      imeConfig.onInstalled();
    }
  }

  onMessage() {

  }

  onMessageExternal() {

  }

}

export class DecoderRuntimeManager extends BaseRuntimeManager {
  constructor() {
    super();
  }

  onInstalled() {

  }

  onConnect() {

  }

  onConnectExternal() {

  }

  onMessage() {

  }
}