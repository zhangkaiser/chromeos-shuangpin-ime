
import Module from "../../libGooglePinyin/decoder.js";



class Decoder extends EventTarget {
    
  _decoder?: IDecoder;

  constructor() {
    super();
    try {
      this._decoder = new Module["Decoder"]();
    } catch(e) {}
  }

  get decoder() {
    try {
        this._decoder = this._decoder 
            ?? (Module["Decoder"] ? new Module["Decoder"]() : undefined);
    } catch(e) { }
    return this._decoder;
  }
  /** @todo */
  decode(source: string, selectedCandID: number) {
    if (!this.decoder) return;
    let candidatesStr = this.decoder.decode(source, selectedCandID);
    let a;
    let candidates = candidatesStr.split("|");
    return candidates;
  }

}