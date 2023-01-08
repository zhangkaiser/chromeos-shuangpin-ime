import { Background } from "./background";
import { ApiController } from "./zhime";

let isZhime = typeof chrome === "object" && Reflect.has(chrome, "input") ? false : true;

export async function main() {
  globalThis.imeAPI = new ApiController(isZhime ? "zhime" : "chromeos");
  let manager = new Background();
  manager.registerChromeConnectionEvent();
  manager.registerChromeIMEEvent();
  manager.registerControllerEventListener();
  
  if (isZhime) {
    manager.stateLoadedPromise = manager.loadingStateForChrome();
  }


}

main();