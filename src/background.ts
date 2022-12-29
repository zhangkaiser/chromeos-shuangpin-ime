import { Controller } from "src/controller";
import { IMessage } from "src/model/common";
import { configFactoryInstance } from "src/model/configfactory";
import { EventType, GlobalState, InputToolCode, MessageType, StateID } from "src/model/enums";
import { IIMEState, ILocalStorageDataModel } from "src/model/state";

/**
 * The UI background class implements the script for the background page of chrome
 * os extension for os input tools.
 */
export class Background {

  /**
   * The controller for chrome os extension.
   */
  controller = new Controller();
  configFactory = configFactoryInstance;

  stateLoadedPromise?: Promise<boolean>;

  registerControllerListener() {
    this.controller.addEventListener(
      EventType.UPDATESTATE, this.updateStateToLocalStorage.bind(this)
    );
  }

  updateStateToLocalStorage() {
    let states = this.configFactory.getCurrentConfig().getStates();
    let global_state = this.configFactory.globalState;
    chrome.storage.local.set({ states, global_state});
  }

  registerChromeConnection() {
    // Sets up a listener which talks to the option page.
    chrome.runtime.onMessage.addListener(this.processMessage.bind(this));
    chrome.runtime.onMessageExternal.addListener(this.processExternalMessage.bind(this));
    chrome.runtime.onConnectExternal.addListener(this.processHostConnect.bind(this));
  }

  onActivate(engineID: string) {
    this.controller.activate(engineID);
  }

  onDeactivated(engineID: string) {
    this.controller.deactivate(engineID);
  }

  async onFocus(context: chrome.input.ime.InputContext) {
    await this.stateLoadedPromise;
    this.controller.register(context);
  }

  onBlur(contextID: any) {
    this.controller.unregister(contextID);
  }

  onReset(engineID: string) {
    this.controller.reset(engineID);
  }

  onKeyEvent(engineID: string, keyEvent: KeyboardEvent, requestId: number) {
    let response = this.controller.handleEvent(engineID as any, keyEvent, requestId);
    imeAPI.keyEventHandled('' + requestId, response);
  }

  onCandidateClicked(engineID: string, candidateID: number, button: /** MouseButton Type */string) {
    this.controller.processNumberKey({ key: candidateID + 1});
  }

  onMenuItemActivated(engineID: string, name: string) {
    this.controller.switchInputToolState(name as any, engineID);
  }

  onInputContextUpdate(context: chrome.input.ime.InputContext) {
    // Pass.
  }

  onSurroundingTextChanged(engineID: string, surrouningInfo: any) {
    // Pass.
  }

  registerChromeIMEEvent() {
    const ime = chrome.input.ime;

    ime.onActivate.addListener(
      (engineID) => {
        this.stateLoadedPromise = this.loadingStateForChrome();
        this.stateLoadedPromise.then((res) => {
          this.controller.activate(engineID);
        });
      }
    );
    (ime as any).onKeyEvent.addListener(
      (engineID: string, keyEvent: KeyboardEvent, requestId: number) => {
  
        return this.controller.handleEvent(engineID as InputToolCode, keyEvent, requestId);
      }
    );

    ime.onDeactivated.addListener(this.onDeactivated.bind(this));
    ime.onFocus.addListener(this.onFocus.bind(this));
    ime.onBlur.addListener(this.onBlur.bind(this));
    ime.onReset.addListener(this.onReset.bind(this));
    ime.onCandidateClicked.addListener(this.onCandidateClicked.bind(this));
    ime.onMenuItemActivated.addListener(this.onMenuItemActivated.bind(this));
    ime.onInputContextUpdate.addListener(this.onInputContextUpdate.bind(this));
    ime.onSurroundingTextChanged.addListener(this.onSurroundingTextChanged.bind(this));

  }

  async loadingStateForChrome() {
    let data: Pick<ILocalStorageDataModel, "states" | "global_state"> = await chrome.storage.local.get(['states', 'global_state']);

    if (data['global_state']) 
      this.configFactory.globalState = data['global_state'];

    let config = this.configFactory.getCurrentConfig();

    if (data['states']) config.setStates(data['states']);
          
    return true;
  }

  /**
   * @todo IME may be inactive.
   * Processes incoming requests from option page.
   */
  processMessage(
    message: IMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (responseData?: any) => void ) {

    message.inputToolCode && this.configFactory.setInputTool(message.inputToolCode);
    switch (message['type']) {
      case MessageType.UPDATE_STATE:
        let data = message.data;
        this.controller.updateState(data.name, data.value);
        sendResponse(true);
        break;
      case MessageType.GET_STATES:
        sendResponse(this.controller.model.states);
        break;
      default:
        console.error("No handler", message.type);
    }

    return true;
  }

  processExternalMessage(
    msg: IMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (responseData?: any) => void ) {
    
    switch (msg['type']) {
      case MessageType.INSTALLED:
        let { id } = sender;
        sendResponse(true);
        break;
      case MessageType.GET_CONFIG:
        return sendResponse({
          "id": "pinyin-zh-CN.compact.qwerty",
          "language": "zh",
          "name": "Chinese"
        })
      case MessageType.GET_STATES:
        return sendResponse(this.configFactory.getCurrentConfig().getStates());
      default:
    }
  }

  processHostMessage(msg: any, port: chrome.runtime.Port) {
    let {type, value} = msg.data;
    if (type in (this as any)) (this as any)[type](...value);
  }

  processHostConnect(port: chrome.runtime.Port) {
    imeAPI.port = port;
    
    port.onMessage.addListener(this.processHostMessage.bind(this));
  }
}