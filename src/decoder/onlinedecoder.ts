import { IMEResponse } from "./response";

export default class OnlineDecoder extends EventTarget implements IDecoder {
  
  constructor(engineID: string) {
    super();
  }

  decode(sourceToken: string, chooseId: number) {
    return new IMEResponse([], [])
  }

  clear() {

  }
}