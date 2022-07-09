/// <reference path="./mvvm.d.ts" />


interface IDecoder {
  new (inputTool: string),
  /** Gets the transliterations(without scores) for the source word. */
  decode(sourceToken:string, chooseId: number): string,
  /** Clear the decoder. */
  clear(): void,
}

interface IModule {
  Decoder: IDecoder
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