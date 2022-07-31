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
  decode(sourceToken: string, chooseId: number): IIMEResponse | null;
  response?: IIMEResponse;
  clear(): void;
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