import { IMesageDataOfDecode, IMessage } from "src/model/common";
import { EventType, MessageType } from "src/model/enums";

export class IMEDecoder extends EventTarget implements IDecoder {
  
  static IME_RESPONSE_EVENT = new CustomEvent(EventType.IMERESPONSE);
  #port?: chrome.runtime.Port;

  #onMessageCb: any;
  #onDisconnectCb: any;

  response?: IIMEResponse;

  constructor(public engineID: string, option: string | {extId: string, annotation: string}) {
    super();
    
    let extId, annotation;
    if (typeof option == 'string') {
      extId = option
    } else {
      extId = option.extId;
      annotation = option.annotation;
    }

    this.#onMessageCb = this.#onMessage.bind(this);
    this.#onDisconnectCb = this.#onDisconnect.bind(this);

    this.#connect(extId, annotation ? `${engineID}::${annotation}` : engineID);
  }

  #connect(extId: string, name: string) {
    this.#port = chrome.runtime.connect(extId, { name });

    this.#port.onMessage.addListener(this.#onMessageCb);
    this.#port.onDisconnect.addListener(this.#onDisconnectCb);
  }

  decode(sourceToken: string, chooseId: number) {

    let data:IMesageDataOfDecode = { source: sourceToken, chooseId }
    let message:IMessage = { type: MessageType.DECODE, data }

    try {
      this.#port?.postMessage(message);
    } catch(e) {
      console.error(e);
      // chrome.runtime.reload();
    }
    return null;
  }

  clear() {
    this.response = undefined;
  }

  #end() {
    this.#port?.disconnect();
    this.#port = undefined;
    this.clear();
  }

  #onMessage(msg: IMessage, port: chrome.runtime.Port) {
    switch(msg['type']) {
      case MessageType.IMERESPONSE:
        this.response = <IIMEResponse>msg.data;
        this.dispatchEvent(IMEDecoder.IME_RESPONSE_EVENT);
    }
  }

  #onDisconnect(port: chrome.runtime.Port) {
    this.#end();
  }
}