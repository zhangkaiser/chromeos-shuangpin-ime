
import Module, { initedPromise, addUserDict } from "googlepinyin";
import {} from "googlepinyin"
import { Candidate } from "./candidate";
import { DataLoader } from "./dataloader";
import { IMEResponse } from "./response";
import { TokenDecoder } from "./tokendecoder";
import { DecoderEventType } from "./consts";
import { IDecoder } from "googlepinyin/out/interfaces";

export default class Decoder{
  
  _decoder?: IDecoder;
  #dataloader: DataLoader;
  #tokenDecoder: TokenDecoder;

  inited = false;

  constructor(
    public inputTool: any, 
    solution: string
  ) {

    this.#dataloader = new DataLoader(inputTool);
    this.#tokenDecoder = new TokenDecoder(this.#dataloader, solution);
    this.#tokenDecoder.addEventListener(DecoderEventType.CLEAR, this.clear.bind(this));
    
    initedPromise.then(() => {
      this._decoder = new Module['Decoder']();
      this.inited = true;
    });
  }

  get decoder() {
    if (this.inited && this._decoder) {
      return  this._decoder;
    } else if (Reflect.has(Module, 'Decoder')) {
      return this._decoder = new Module['Decoder'](); 
    } else {
      return null;
    } 
  }
  

  decode(sourceWord: string, selectedCandID: number) {
    if (!this.decoder) return null;
    let { shuangpinStatus } = this.#dataloader;

    let tokenPath = shuangpinStatus 
      ? this.#tokenDecoder.getShuangpinTokens(sourceWord)
      : this.#tokenDecoder.getBestTokens(sourceWord);

    if (!tokenPath) return null;
    
    let candidates: Candidate[] = [];
    let originalTokenList = this.#tokenDecoder.getOriginalTokens(tokenPath);
    
    let pinyinStr = shuangpinStatus ? tokenPath.tokens.join("\'") : originalTokenList.join("'");

    let targets: string[] = this.decoder.decode(pinyinStr, -1).split("|");
    
    for (let i = 0, l = targets.length; i < l; i++) {
      let target = targets[i];
      if (!target) continue;
      candidates.push(new Candidate(
        target.length, target, 0, i
      ));
    }

    return new IMEResponse(originalTokenList, candidates);
  }

  addUserCommit(source: string, target: string) {
    if (this.decoder) {
      addUserDict(this.decoder, source, target);
    }
  }

  getPredicts(history: string) {
    let candidates: Candidate[] = [];

    let candidateListStr = this.decoder?.getPredicts(history);
    if (candidateListStr) {
      candidateListStr.split("|").forEach((target, index) => {
        if (target) candidates.push(
          new Candidate(target.length, target, 0, index)
        );
      });
    }

    return candidates;
  }

  clear() {
    this.#tokenDecoder.clear();
    this.decoder?.clear();
  }

  reset() {
    this.clear();
    this.decoder?.delete();
    this._decoder = undefined;
  }
  
  
}