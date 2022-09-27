
import Module, { startRun } from "../../libGooglePinyin/decoder.js";
import { Candidate } from "./candidate";
import { DataLoader } from "./dataloader";
import { IMEResponse } from "./response";
import { TokenDecoder } from "./tokendecoder";

function runWasm() {
  return new Promise((resolve, reject) => {
    Module['onRuntimeInitialized'] = resolve;
    startRun();
  });
}

export default class Decoder extends EventTarget implements IDecoder {
  
  #decoder?: IWASMDecoder;
  #dataloader: DataLoader;
  #tokenDecoder: TokenDecoder;

  initPromise: Promise<any>;
  inited = false;

  constructor(public inputTool: any, 
    solution?: string[] | string,
    enableUserDict?: boolean
  ) {
    super();

    this.#dataloader = new DataLoader(inputTool);
    this.#tokenDecoder = new TokenDecoder(this.#dataloader, solution);
    this.#tokenDecoder.addEventListener('clear', this.clear.bind(this));
    this.initPromise = runWasm();
    
    this.initPromise.then(() => {
      this.#decoder = new Module['Decoder']();
      this.inited = true;
    })
  }

  get decoder() {
    if (this.inited && this.#decoder) {
      return this.#decoder;
    } else if (Reflect.has(Module, 'Decoder')) {
      return this.#decoder = new Module['Decoder'](); 
    } else {
      return null;
    }
  }
  
  /** @todo selectedCandID argument is not used. */
  decode(sourceWord: string, selectedCandID: number) {
    if (!this.decoder) return null;
    let { shuangpinStatus } = this.#dataloader;

    let tokenPath;
    if (shuangpinStatus) {
      tokenPath = this.#tokenDecoder.getShuangpinTokens(sourceWord);
    } else {
      tokenPath = this.#tokenDecoder.getBestTokens(sourceWord);
    }

    if (!tokenPath) return null;
    
    let candidates: Candidate[] = [];
    let targets: string[] = [];
    let originalTokenList = this.#tokenDecoder.getOriginalTokens(tokenPath);
    
    if (shuangpinStatus) {
      // Shuangpin decode.
      let tokens = tokenPath.tokens;
      targets = this.decoder.decode(tokens.join('\''), -1).split('|');


    } else {
      // Pinyin decode.
      let pinyin = originalTokenList.join('');
      targets = this.decoder.decode(pinyin, -1).split('|');  
    }
    for (let i = 0, l = targets.length; i < l; i++) {
      let target = targets[i];
      if (!target) continue;
      candidates.push(new Candidate(
        target.length, target, 0, i
      ));
    }

    return new IMEResponse(originalTokenList, candidates);
  }

  clear() {
    this.#tokenDecoder.clear();
    this.decoder?.clear();
  }
  
  
}