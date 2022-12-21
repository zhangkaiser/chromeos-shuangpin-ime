import { DecoderItemManager } from "./decoder";
import { IMELifecycle } from "./imelifecycle";

export class IMEEventDispatcher {
  
  decoders: DecoderItemManager[] = [];
  mainDecoder?: DecoderItemManager;
  constructor(public lifecycle: IMELifecycle) {

  }

  add(decoder: DecoderItemManager) {
    if (decoder.main) {
      this.mainDecoder = decoder;
      decoder.onmessage = (msg: IMessageProps, manager: DecoderItemManager) => {
        let {type, value} = msg.data;

        let subDecoders = this.decoders.filter(decoder => decoder.handleEvent(type, value));
        if (subDecoders.length === 0 && !this.lifecycle.handleIMEEvent(type, value)) {
          throw new Error(`Not found IME event handler of ${type}.`);
        }
      }
    } else {
      this.decoders.push(decoder);
      // TODO! Currently not support.
      decoder.onmessage = (msg: IMessageProps, manager: DecoderItemManager) => {
        let {type, value} = msg.data;
        if (!this.lifecycle.handleIMEEvent(type, value)) {
          throw new Error(`Not found IME event handler of ${type}`);
        }
      }
    }
  }

  connects() {
    // todo: may be errors!
    this.decoders.forEach((port) => {
      port.connect();
    });
  }

  dispatch(name: MessageType, value: any[]) {
    if (!this.mainDecoder) throw new Error("Must be have main decoder.");
    this.mainDecoder.postMessage({
      data: {
        type: name,
        value
      }
    });

    this.decoders.forEach((decoder) => {
      decoder.handleEvent(name, value);
    });
  }

  disposes() {
    this.decoders.forEach((port) => {
      port.dispose();
    });
  }

}