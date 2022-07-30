import WASMDecoder from "src/decoder/cdecoder";
import JSDecoder from "src/decoder/decoder";
import OnlineDecoder from "src/decoder/onlinedecoder";
import { Decoders } from "src/model/enums";


interface IMessage {
  decoder: Decoders,
  code: string,
  text: string
}

const decoders = new Map();

// Tree-shaking support.
if (process.env.WASM) { decoders.set(Decoders.WASM, WASMDecoder) }

if (process.env.JS) { decoders.set(Decoders.JS, JSDecoder) }

if (process.env.ONLINE) { decoders.set(Decoders.ONLINE, OnlineDecoder) }

if (process.env.ALL) {
  decoders.set(Decoders.WASM, WASMDecoder);
  decoders.set(Decoders.JS, JSDecoder);
  decoders.set(Decoders.ONLINE, OnlineDecoder);
}

export default class DecoderBackground {
  
  #runtime = new Map();

  constructor() {
    
    decoders.forEach((Decoder, key) => {
      this.#runtime.set(key, new Decoder())
    })

    chrome.runtime.onMessage.addListener(this.#onMessage.bind(this));
    chrome.runtime.onConnect.addListener(this.#onConnect.bind(this));
  }

  /** @todo */
  #onMessage(msg: IMessage, sender: chrome.runtime.MessageSender, write: (data: any) => void) {
    let {code, text} = msg;
    let Decoder = this.#runtime.get(msg.decoder);
    if (!Decoder) {
      write(false);
      return true;
    }

    let instance = new Decoder();

    return true;
    
  }

  #onConnect(port: chrome.runtime.Port) {

  }
}