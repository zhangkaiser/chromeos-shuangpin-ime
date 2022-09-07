import { IMEResponse } from "./response";

/** Locale test extid */
const googleInputExtID = "gkckmcceljejgjpphcoepifmhiiogjbg";

/**
 * @todos layouts, imeconfigs
 */

export default class OnlineDecoder extends EventTarget implements IDecoder {
  
  constructor(engineID: string) {
    super();
  }

  #sendMessage(data: any) {
    return new Promise((resolve: (value: any) => void, reject) => {
      try {
        chrome.runtime.sendMessage(googleInputExtID, data, resolve);
      } catch(e) { 
        reject(e); 
      }
    })
  }

  #getConfig() {
    // 1, Current config name.
    // 2, config name list.
    // 10, Curent config name.
    return this.#sendMessage({gp: true})
  }

  decode(sourceToken: string, chooseId: number) {
    return new IMEResponse([], [])
  }

  clear() {

  }


  addUserCommits(source: string, target: string) {}
  enableUserDict(eanble: boolean) {}
  enableTraditional(enable: boolean) {}
}