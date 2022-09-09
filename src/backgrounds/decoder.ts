import WASMDecoder from "src/decoder/cdecoder";
// import JSDecoder from "src/decoder/decoder";
import OnlineDecoder from "src/decoder/onlinedecoder";
import { IMesageDataOfDecode, IMessage } from "src/model/common";
import { Decoders, MessageType } from "src/model/enums";


const decoders = new Map();

// Tree-shaking support.
if (process.env.WASM) { decoders.set(Decoders.WASM, WASMDecoder) }

if (process.env.ONLINE) { decoders.set(Decoders.ONLINE, OnlineDecoder) }

if (process.env.ALL) {
  decoders.set(Decoders.WASM, WASMDecoder);
  decoders.set(Decoders.ONLINE, OnlineDecoder);
}

function getDecoderCode(code: string): [Decoders, string, string] {
  let decoder = /wasm/.test(code) ? Decoders.WASM : Decoders.ONLINE;
    let info = code.split("::");
    let engineID, annotation;

    if (info.length == 2) {
      engineID = info[0];
      annotation = info[1];
    } else {
      engineID = info[0];
      annotation = "";
    }

  return [decoder, engineID, annotation];
}

export default class DecoderBackground {
  
  #decoder?: IDecoder;
  #port?: chrome.runtime.Port;

  constructor() {
    chrome.runtime.onInstalled.addListener(this.#onInstall.bind(this));
    chrome.runtime.onMessageExternal.addListener(this.#onMessage.bind(this));
    chrome.runtime.onConnectExternal.addListener(this.#onConnect.bind(this));
  }

  #onInstall() {
    chrome.runtime.sendMessage(process.env.IMEUIID as string, {type: MessageType.INSTALLED})
  }

  /** @todo */
  #onMessage(msg: IMessage, sender: chrome.runtime.MessageSender, write: (data: any) => void) {
    // let {code, text} = msg;
    // let Decoder = this.#runtime.get(msg.decoder);
    // if (!Decoder) {
    //   write(false);
    //   return true;
    // }

    // let instance = new Decoder();

    // return true;
    
  }

  processMessage(msg: IMessage, port: chrome.runtime.Port) {
    switch(msg['type']) {
      case MessageType.DECODE:
        if (!this.#decoder) return port.postMessage(false);
        let data = <IMesageDataOfDecode>msg.data;
        let response = this.#decoder.decode(data.source, data.chooseId);
        if (!response) return port.postMessage([]);

        let message:IMessage = {
          type: MessageType.IMERESPONSE,
          data: {...response}
        }
        port.postMessage(message);
        break;
      default:
        port.postMessage("Hello world!");
    }
  }

  processDisconnect(port: chrome.runtime.Port) {
    this.#decoder?.clear();
    this.#decoder = undefined;
    this.#port = undefined;
  }

  #onConnect(port: chrome.runtime.Port) {
    if (this.#port) {
      this.#port.disconnect();
    }

    this.#port = port;
    // [Decoders, engineID]
    let [decoderCode, engineID, annotation] = getDecoderCode(port.name);
    
    let Decoder = decoders.get(decoderCode);
    if (!Decoder) port.postMessage(false);

    this.#decoder = new Decoder(engineID, annotation);

    this.#port.onMessage.addListener(this.processMessage.bind(this));
    this.#port.onDisconnect.addListener(this.processDisconnect.bind(this));
  }
}
