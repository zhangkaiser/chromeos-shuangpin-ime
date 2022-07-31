import { IMEResponse } from "./response";

export default class OnlineDecoder implements IDecoder {
  
  constructor(engineID: string) {
    
  }

  decode(sourceToken: string, chooseId: number) {
    return new IMEResponse([], [])
  }

  clear() {

  }
}