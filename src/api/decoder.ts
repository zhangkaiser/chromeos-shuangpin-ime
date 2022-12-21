import { EventType } from "src/model/enums";
import { imeConfig } from "./setglobalconfig";

export class DecoderItemManager {
  
  #port?: chrome.runtime.Port;

  #main = false;
  #permissions: IDecoderPermission = [];
  #shortcuts: IDecoderShortcuts = [];

  get main() {
    return this.#main;
  }

  get permissions() {
    return this.#permissions;
  }

  get shortcuts() {
    return this.#shortcuts;
  }

  set config(data: IDecoderConfig) {
    this.#main = data[0];
    this.#permissions = data[1];
    this.#shortcuts = data[2];
  }

  messageCb: any;

  onmessage?: any;

  constructor(public extID: string, config: IDecoderConfig) {
      this.config = config;
  }

  dispose() {
    this.#port?.disconnect();
  }

  connect() {
    this.#port = imeConfig.runtime.connect(this.extID);
    this.messageCb = this.onMessage.bind(this);
    this.#port!.onMessage.addListener(this.messageCb);
    this.#port!.onDisconnect.addListener(() => {
      this.#port = undefined;
    });
  }

  onMessage(msg: IMessageProps, port: chrome.runtime.Port) {
    if (this.onmessage) {
      this.onmessage(msg, this);
    }
  }

  handleEvent(eventName: string, value: any[]) {
    if (this.#permissions?.indexOf(eventName)) {


      // TODO(shortcuts and keys support.)
      if (eventName === "onKeyEvent") {
        let keyEvent = value[1] as chrome.input.ime.KeyboardEvent;
        let requestId = value[2] as number;

        if (keyEvent.type == EventType.KEYDOWN) {
          this.postMessage({
            data: {
              type: eventName as any,
              value
            }
          })
        }
        
        imeConfig.ime.keyEventHandled({requestId, response: true});
      }
      this.postMessage({
        data: {
          type: eventName as any,
          value
        }
      });
      return true;
    } else {
      return false;
    }
  }

  postMessage(msg: IMessageProps) {
    if (!this.#port) this.connect();

    try {
      this.#port?.postMessage(msg);
    } catch(e) {
      throw new Error(`Extension connect failed with ${this.extID}.`);
    }
  }
}