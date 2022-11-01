import { IMesageDataOfDecode, IMessage } from "src/model/common";
import { EventType, MessageType } from "src/model/enums";

export class IMEDecoderProxy extends EventTarget implements IDecoder {
  
  #port?: chrome.runtime.Port;

  #onMessageCb: any;
  #onDisconnectCb: any;


  constructor(public engineID: string, option: string | {extId: string, annotation: string}) {
    super();
    
    let {extId, annotation} = this.#handleOption(option);
    
    this.#onMessageCb = this.#onMessage.bind(this);
    this.#onDisconnectCb = this.#onDisconnect.bind(this);

    this.#connect(extId, annotation ? `${engineID}::${annotation}` : engineID);
  }

  #handleOption(option: string | {extId: string, annotation: string}) {
    
    let extId, annotation;
    if (typeof option == 'string') {
      extId = option
    } else {
      extId = option.extId;
      annotation = option.annotation;
    }

    return {extId, annotation};
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
    this.#port?.postMessage({
      type: MessageType.CLEAR,
      data: {}
    });
  }

  addUserCommits(source: string, target: string) {
    try {
      this.#port?.postMessage({
        type: MessageType.ADD_USER_COMMITS,
        data: {
          source,
          target
        }
      });
    } catch(e) {
      console.error(e);
    }
  }

  #end() {
    this.#port?.disconnect();
    this.#port = undefined;
    this.clear();
  }

  #onMessage(msg: IMessage, port: chrome.runtime.Port) {
    switch(msg['type']) {
      case MessageType.IMERESPONSE:
        this.dispatchEvent(new CustomEvent(EventType.IMERESPONSE, {
          detail: msg.data
        }));
        break;
    }
  }


  #onDisconnect(port: chrome.runtime.Port) {
    this.#end();
  }


}