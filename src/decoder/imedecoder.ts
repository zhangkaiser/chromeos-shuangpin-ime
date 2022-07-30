import { IMEResponse } from "./decoder";

export class IMEDecoder implements IDecoder {
  constructor(engineID: string) {

  }

  decode(sourceToken: string, chooseId: number) {
    return new IMEResponse([], []);
  }

  clear() {

  }
}