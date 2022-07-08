
import Module from "../../libGooglePinyin/decoder.js";
import { InputToolCode } from "../model/enums.js";
import { TokenDecoder } from "./tokendecoder";
export default class Decoder {
    
  #decoder?: IDecoder;
  #tokenDecoder: TokenDecoder; 

  constructor(public inputTool: InputToolCode) {
    // TODO
    this.#tokenDecoder = new TokenDecoder(inputTool, { });
    try {
      this.#decoder = new Module["Decoder"]();
    } catch(e) {}
  }

  get decoder() {
    try {
      this.#decoder = this.#decoder 
        ?? (Module["Decoder"] ? new Module["Decoder"]() : undefined);        
    } catch(e) { }
    return this.#decoder;
  }
  
  /** @todo */
  decode(source: string, selectedCandID: number) {
    if (!this.decoder) return ;

    // Get the pinyin best token.(support pinyin and shuangpin).
    let tokens = this.#tokenDecoder.getBestTokens(source);
    let candidatesStr = this.decoder.decode(source, selectedCandID);
    let a;
    let candidates = candidatesStr.split("|");
    return candidates;
  }

}