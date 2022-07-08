import { sourceMap, chosTokens, defaultProb, initialTokens } from "./staticdata";
import { InputTool } from "./enums";
import { targetMap } from "./targetMap";
import { targetPositions } from "./targetPositions";
import { targetSegments } from "./targetSegments";
import { sourceSegments } from "./sourceSegments";
import { targetProbs } from "./targetProbs";
/**
 * DataLoader provides the functions to load token
 * dictionary, generation model and dictionary for the offline transliterator.
 */
export class DataLoader {

  sourceMap:{[str: string]: number[]} = sourceMap;
  defaultProb: number = defaultProb;
  targetMap = targetMap;
  targetPositions = targetPositions;
  targetSegments = targetSegments;
  targetProbs = targetProbs;
  sourceSegments = sourceSegments;
  constructor(private inputTool: InputTool) {
  }
}