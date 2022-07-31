import { IMesageDataOfDecode, IMessage } from "src/model/common";
import { EventType, MessageType } from "src/model/enums";
import { IMEResponse } from "./response";

export class IMEDecoder extends EventTarget implements IDecoder {
  
  static IME_RESPONSE_EVENT = new CustomEvent(EventType.IMERESPONSE);
  #port: chrome.runtime.Port;

  response?: IIMEResponse;

  constructor(engineID: string, extId: string) {
    super();
    this.#port = chrome.runtime.connect(extId, {
      name: engineID
    });

    this.#port.onMessage.addListener(this.#onMessage.bind(this));
    this.#port.onDisconnect.addListener(this.#onDisconnect.bind(this));

  }

  decode(sourceToken: string, chooseId: number) {
    
    let message:IMesageDataOfDecode = {
      source: sourceToken,
      chooseId
    }
    this.#port.postMessage(message);

    return null;
  }

  clear() {
    this.response = undefined;
  }

  #onMessage(msg: IMessage, port: chrome.runtime.Port) {
    switch(msg['type']) {
      case MessageType.IMERESPONSE:
        this.response = <IIMEResponse>msg.data;
        this.dispatchEvent(IMEDecoder.IME_RESPONSE_EVENT);
    }
  }

  #onDisconnect(port: chrome.runtime.Port) {
    this.clear();
  }
}