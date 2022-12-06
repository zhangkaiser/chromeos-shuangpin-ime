/**
 * The IME UI API manager entry.
 * 
 * Blueprints:
 * Handling user input event forwarding
 * Handling connections between more extensions.
 */

import { Controller } from "src/controller";

import { IMELifecycle } from "src/api/imelifecycle";
import { IMEEventDispatcher } from "src/api/eventdispatcher";
import { UIRuntimeManager as Runtime, runtimeEventList } from "src/api/runtime";
import { imeConfig } from "src/api/setglobalconfig";


function getEventListener<T>(manager: Record<string, Function>,  eventName: string) {
  if (eventName in manager) {
    return manager[eventName].bind(manager);
  }
  return null;
}

class IMEUIManager {

  imeLifecycleManager: IMELifecycle;
  imeEventDispatcher: IMEEventDispatcher;
  runtimeManager: Runtime;

  constructor(public globalState: IGlobalState) {

    this.runtimeManager = new Runtime();
    this.imeLifecycleManager = new IMELifecycle();
    
    this.imeEventDispatcher = new IMEEventDispatcher();
    this.registerEventDispatcher();

    this.registerConnection();
  }

  async initialize() {
    this.runtimeManager.registerListeners();
    this.runtimeManager.addEventListener("states", () => {

    });

    this.imeLifecycleManager.registerListeners();
    this.imeEventDispatcher.registerEventDispatcher();

  }

  registerRuntimeListener() {
    
  }


  registerEventDispatcher() {
    
  }

  registerUserInputEvent() {
  }

  registerConnection() {

  }
}


async function main() {
  let globalState = await imeConfig.getGlobalState();

  let uiManager = new IMEUIManager(globalState);
  await uiManager.initialize();
}

main();

