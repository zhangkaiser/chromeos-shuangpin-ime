import wasm from "decoder";
import { Candidate } from "./candidate";


class Decoder {
  constructor() {
    let Module = wasm['Module'];
    Module['onRuntimeInitialized'] = () => {
      
    }
  }
}