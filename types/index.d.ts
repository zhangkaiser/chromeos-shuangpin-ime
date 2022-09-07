/// <reference path="./mvvm.d.ts" />

interface ICandidate {
  /** The number of source tokens transliterated */
  range: number;
  /** The target word. */ 
  target:string;
  /** The score. */
  score: number;
  /** The candidate id. */ 
  candID: number;
}

interface IIMEResponse {
  tokens: string[],
  candidates: ICandidate[]
}

interface IWASMDecoder {
  new (inputTool: string),
  /** Gets the transliterations(without scores) for the source word. */
  decode(sourceToken:string, chooseId: number): string,
  /** Clear the decoder. */
  clear(): void,
}

/** Decoder interface. */
interface IDecoder extends EventTarget {
  
  /** Transliterations for the source word.  */
  decode(sourceWord: string, chooseId: number): IIMEResponse | null;
  
  /** @deprecated IME decoder response data. */
  response?: IIMEResponse;
  
  /** Clear the decoder */
  clear(): void;

  /** Adds user selected candidates */
  addUserCommits(source: string, target: string);

  /** Enables/Disables the user dictionary. */
  enableUserDict(enable: boolean);

  /** Enables/Disables the traditional Chinese. */
  enableTraditional(enable: boolean);
  
}

/** WASM Module interface */
interface IModule {
  Decoder: IWASMDecoder
}

declare module "../../libGooglePinyin/decoder.js" {
  let Module: IModule;
  export default Module; 
}

interface Window {
  Module: Module
}

type TargetPosition = ({
  index: number;
  position: number;
  source: number | number[]
}) | undefined

type TargetSegment = ({
  index: number,
  segment: number | number[],
  prob: number
})