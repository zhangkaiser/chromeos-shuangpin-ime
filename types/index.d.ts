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
interface IDecoder {
  decode(sourceToken: string, chooseId: number): IIMEResponse | null,
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


interface UserStorageConfig {
  chos_init_punc_selection: boolean,
  chos_next_page_selection: boolean,
  chos_prev_page_selection: boolean,
  chos_init_sbc_selection: boolean,
  chos_init_vertical_selection: boolean,
  chos_init_enable_traditional: boolean,
  solution: string
}