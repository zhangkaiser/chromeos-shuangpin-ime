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

  sendMessage(msg: IMessageProps) {
    msg.extID 
      ? imeConfig.runtime.sendMessage(msg.extID, msg.data, msg.cb)
      : imeConfig.runtime.sendMessage(msg.data, msg.cb);
  }
}


export class UIRuntimeManager extends BaseRuntimeManager {
  constructor() {
    super();
  }

  onInstalled() { 
    console.log("onInstalled");
    if (imeConfig.onInstalled) {
      imeConfig.onInstalled();
    }
  }

  onMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {

  }

  onMessageExternal(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {

  }

  onConnect() {

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