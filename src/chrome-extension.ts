import { Background } from "./background";
import { ApiController } from "./zhime";

let isZhime = Reflect.has(chrome, "input") ? false : true;

export async function main() {
  globalThis.imeAPI = new ApiController(isZhime ? "zhime" : "chromeos");
  let manager = new Background();
  manager.registerChromeConnection();
  if (!isZhime) manager.registerChromeIMEEvent();

  if (isZhime) {
    manager.stateLoadedPromise = manager.loadingStateForChrome();
  }

  manager.registerControllerListener();

}

main();