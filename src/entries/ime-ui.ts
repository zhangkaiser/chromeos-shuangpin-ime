/**
 * The IME UI API manager entry.
 * 
 * Blueprints:
 * Handling user input event forwarding
 * Handling connections between more extensions.
 */

import { IMELifecycle } from "src/api/imelifecycle";
import { IMEEventDispatcher } from "src/api/eventdispatcher";
import { UIRuntimeManager as Runtime, runtimeEventList } from "src/api/runtime";
import { imeConfig } from "src/api/setglobalconfig";
import { DecoderItemManager } from "src/api/decoder";


class IMEUIManager {

  imeLifecycleManager: IMELifecycle;
  imeEventDispatcher: IMEEventDispatcher;
  runtimeManager: Runtime;

  constructor(public globalState?: IGlobalState) {
    
    this.runtimeManager = new Runtime();
    this.imeLifecycleManager = new IMELifecycle();
    
    this.imeEventDispatcher = new IMEEventDispatcher(this.imeLifecycleManager);
    this.imeLifecycleManager.eventDispatcher = this.imeEventDispatcher;

  }

  async initialize() {
    this.runtimeManager.registerListeners();

    this.imeLifecycleManager.registerListeners();

    this.registerConnection();

  }

  registerUserInputEvent() {
  }

  registerConnection() {
    if (this.globalState && 'decoders' in this.globalState) {

      this.globalState.decoders.forEach((item) => {
        let itemManager = new DecoderItemManager(item[0] as string, item[1]);
        this.imeEventDispatcher.add(itemManager);
      });
    }
  }
}


async function main() {
  let globalState = await imeConfig.getGlobalState();
  
  let uiManager = new IMEUIManager(globalState);
  await uiManager.initialize();

}

main();

