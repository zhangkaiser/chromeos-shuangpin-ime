import { IMEResponse } from "./response";

export class IMEDecoder implements IDecoder {
  
  constructor(engineID: string) {
    
  }

  decode(sourceToken: string, chooseId: number) {
    return new IMEResponse([], []);
  }

  clear() {

  }
}