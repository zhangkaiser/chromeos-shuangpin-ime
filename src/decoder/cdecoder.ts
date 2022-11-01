
import Module, { initPromise } from "../../libGooglePinyin/decoder.js";
import { Candidate } from "./candidate";
import { DataLoader } from "./dataloader";
import { IMEResponse } from "./response";
import { TokenDecoder } from "./tokendecoder";
import { DecoderEventType } from "./consts";

export default class Decoder extends EventTarget implements IDecoder {
  
  #decoder?: IWASMDecoder;
  #dataloader: DataLoader;
  #tokenDecoder: TokenDecoder;

  inited = false;

  constructor(public inputTool: any, 
    solution?: string[] | string,
    enableUserDict?: boolean
  ) {
    super();

    this.#dataloader = new DataLoader(inputTool);
    this.#tokenDecoder = new TokenDecoder(this.#dataloader, solution);
    this.#tokenDecoder.addEventListener(DecoderEventType.CLEAR, this.clear.bind(this));
    
    initPromise.then(() => {
      this.#decoder = new Module['Decoder']();
      this.inited = true;
    })
  }

  get decoder() {
    if (this.inited) {
      return  this.#decoder;
    } else if (Reflect.has(Module, 'Decoder')) {
      return this.#decoder = new Module['Decoder'](); 
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


  _addUserCommit(pinyinStr: string, target: string) {
    if (!this.decoder) return;
    let selectedCandID = -1;
    let maxLoop = 9;
    let sliceStartPos = 0;

    for (let i = 0; i < maxLoop; i++) {
      let candidates = this.decoder?.decode(pinyinStr, selectedCandID);
      let currentTarget = target.slice(sliceStartPos);

      let candidateList = candidates.split("|");
      if (candidateList.length === 1 || (i == 0 && candidates.startsWith(target))) return;

      if (candidates.startsWith(target)) {
        selectedCandID = 0;
      } else {
        selectedCandID = candidateList.sort((a: string, b: string) => b.length - a.length)
        .findIndex((value: string) => currentTarget.startsWith(value));
        sliceStartPos += candidateList[selectedCandID].length;        
      }

      // Avoid decoder lemma issue.      
      if (selectedCandID == 0) {
        this.decoder.decode(pinyinStr, -1);
      }

    }
    
  }

  addUserCommits(source: string, target: string) {
    if (/[a-zA-Z]/.test(target)) return ;
    this._addUserCommit(source, target);
  }

  clear() {
    this.#tokenDecoder.clear();
    this.decoder?.clear();
    Module['refreshFS']();
  }

  reset() {
    this.#decoder = new Module['Decoder']();
  }
  
  
}