
import Module from "../../libGooglePinyin/decoder";
import { IShuangpinModel } from "../model/customShuangpin";
import { InputToolCode } from "../model/enums";
import { Candidate } from "./candidate";
import { DataLoader } from "./dataloader";
import { IMEResponse } from "./decoder.js";
import { TokenDecoder } from "./tokendecoder";
export default class Decoder {
    
  #decoder?: IWASMDecoder;
  #dataloader: DataLoader;
  #tokenDecoder: TokenDecoder; 

  constructor(inputTool: any, 
    solution?: string[] | IShuangpinModel,
    enableUserDict?: boolean
  ) {
    // TODO
    this.#dataloader = new DataLoader(inputTool);
    this.#tokenDecoder = new TokenDecoder(inputTool, solution);
    
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
  
  /** @todo selectedCandID argument is not used. */
  decode(sourceWord: string, selectedCandID: number) {
    if (!this.decoder) return null;
    let { shuangpinStatus } = this.#dataloader;

    // Get the pinyin best token.(support pinyin and shuangpin).
    let tokenPath = this.#tokenDecoder.getBestTokens(sourceWord);
    if (!tokenPath) return null;
    
    let candidates: Candidate[] = []
    
    if (shuangpinStatus) {
      // Shuangpin decode.
      let tokens = tokenPath.tokens;
      let targets = this.decoder.decode(tokens.join('\''), -1).split('|');

      for (let i = 0, l = targets.length; i < l; i++) {
        let target = targets[i];
        candidates.push(new Candidate(
          sourceWord.length,
          target,
          0,
          -1
        ));
      }
    } else {
      // Pinyin decode.
      let isAllInitials = this.#tokenDecoder.isAllInitials(tokenPath.tokens);
  
    }
    // Also return the token list.
    let originalTokenList = this.#tokenDecoder.getOriginalTokens(tokenPath);
    return new IMEResponse(originalTokenList, candidates);

  }

}