import staticData from "./staticdata";
// import targetMap from "./targetMap";
// import targetPositions from "./targetPositions";
// import targetSegments from "./targetSegments";
// import sourceSegments from "./sourceSegments";
// import targetProbs from "./targetProbs";

import { isPinyin } from "../utils/regexp";
/**
 * DataLoader provides the functions to load token
 * dictionary, generation model and dictionary for the offline transliterator.
 */
export class DataLoader {

  defaultProb: number = 10000;

  sourceMap:{[str: string]: number[]} = {};
  chosTokens: string = "";
  initialTokens: string = "";

  targetMap: any[] = [];
  targetPositions: any[] = [];
  targetSegments: any[] = [];
  targetProbs: any[]  = [];
  sourceSegments: any[] = [];

  /** Shuangpin status. */
  shuangpinStatus: boolean = false;
  constructor(public inputToolCode: string) {
    // if (process.env.ALL) {
    //   // if (isJS(inputToolCode)) {
    //   //   let { sourceMap, chosTokens, initialTokens } = staticData();
    //   //   this.sourceMap = sourceMap;
    //   //   this.chosTokens = chosTokens;
    //   //   this.initialTokens = initialTokens;

    //   //   this.targetMap = targetMap();
    //   //   this.targetPositions = targetPositions();
    //   //   this.targetSegments = targetSegments();
    //   //   this.targetProbs = targetProbs();
    //   //   this.sourceSegments = sourceSegments();
    //   // } else {
    //   let { chosTokens, initialTokens } = staticData();
    //   this.chosTokens = chosTokens;
    //   this.initialTokens = initialTokens;
    //   // }
    // }

    // if (process.env.WASM) {
      let { chosTokens, initialTokens } = staticData();
      this.chosTokens = chosTokens;
      this.initialTokens = initialTokens; 
    // }


    this.shuangpinStatus = isPinyin(inputToolCode) ? false : true;
  }
}