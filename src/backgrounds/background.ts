import { Controller } from "src/controller";
import { IMessage } from "src/model/common";
import { configFactoryInstance } from "src/model/configfactory";
import { EventType, GlobalState, InputToolCode, MessageType, StateID } from "src/model/enums";
import { IIMEState, IInitedState } from "src/model/state";
import { enableDebug } from "src/utils/debug";
import { loadDict } from "src/utils/transform";

// enableDebug();

/**
 * The background class implements the script for the background page of chrome
 * os extension for os input tools.
 */
export default class Background {

  /**
   * The controller for chrome os extension.
   */
  private _controller = new Controller();
  configFactory = configFactoryInstance;

  #loadedPromise: Promise<IInitedState>; 

  constructor() {
    // Register message listener.
    this.#registerMessage();
    this.#registerConnect();
    this.#loadedPromise = this.#loadingState();
    this.#init();

    this._controller.addEventListener(
      EventType.UPDATESTATE,
      this.#updateStateToStorage.bind(this)
    );
  }

  #updateStateToStorage() {
    let states = this._controller.model.states;
    let globalState = this.configFactory.globalState;

    chrome.storage.local.set({
      states,
      globalState
    })
  }

  #registerMessage() {
    // Sets up a listener which talks to the option page.
    chrome.runtime.onMessage.addListener(this.processRequest.bind(this));
    chrome.runtime.onMessageExternal.addListener(this.processExternal.bind(this));
  }

  #registerConnect() {
    chrome.runtime.onConnectExternal.addListener(this.processConnect.bind(this));
  }

  /** Initializes the background scripts. */
  #init() {
    chrome.runtime.onInstalled.addListener((res) => {
      // if (res.reason === 'install') {
      //   // The default input tool configure.
      //   this.#updateStateToStorage();
      // }
    })

    chrome.input.ime.onActivate.addListener((engineID) => {
      this.#loadedPromise.then((res) => {

        let config = this.configFactory.getConfig(engineID as InputToolCode);

        res['states'] && config.setStates(res['states']);
        
        this._controller.activate(engineID as InputToolCode);
      });
    })

    chrome.input.ime.onDeactivated.addListener((engineID) => {
      this._controller.deactivate(engineID);
    });
  
    chrome.input.ime.onFocus.addListener((context) => {
      this._controller.register(context);
    });
  
    chrome.input.ime.onBlur.addListener((contextID) => {
      this._controller.unregister(contextID);
    });

    chrome.input.ime.onReset.addListener((engineID) => {
      this._controller.reset(engineID);
    });

    (chrome.input.ime.onKeyEvent.addListener as any)(
      (engineID: string, keyEvent: KeyboardEvent, requestId: number) => 
      {
        return this._controller.handleEvent(engineID as InputToolCode, keyEvent, requestId);
      }
    );

    // TODO
    chrome.input.ime.onCandidateClicked.addListener((
    engineID: string, candidateID: number, button: /** MouseButton Type */string) => {
      this._controller.processNumberKey({ key: candidateID + 1});
    });

    // TODO
    chrome.input.ime.onMenuItemActivated.addListener((
      engineID, name) => {
      this._controller.switchInputToolState(name as any, engineID);
    });
  
    // TODO
    chrome.input.ime.onInputContextUpdate.addListener((context) => {
    });

    // TODO (important!)It can reactivate the IME form inactivate state.
    chrome.input.ime.onSurroundingTextChanged.addListener((engineID, surroundingInfo) => {
      this._controller.handleSurroundingText(engineID, surroundingInfo);
    })

  }

  /**
   * @todo May be multiple storage states with different configs.
   * Loading state.
   * Restore the state from cached.
   */
  #loadingState() {
    return new Promise((resolve: (value: IInitedState) => void, reject) => {
      chrome.storage.local.get(['states', 'globalState'], (res) => {
        if (!res) resolve({});
        // if (res['states']) {
        //   let states = res['states'] as IIMEState;
        //   if (states.traditional) {
        //     // Early Loading Chinese Traditional dict.
        //     loadDict();
        //   }
        // }

        if(res['globalState']) {
          this.configFactory.globalState = res['globalState'];
        }

        resolve(res as IInitedState);
      });
    });
  }

  /**
   * @todo IME may be inactive.
   * Processes incoming requests from option page.
   */
  processRequest(
    message: IMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (responseData?: any) => void ) {

    message.inputToolCode && this.configFactory.setInputTool(message.inputToolCode);
    switch (message['type']) {
      case MessageType.UPDATE_STATE:
        let data = message.data;
        this._controller.updateState(data.name, data.value);
        sendResponse(true);
        break;
      case MessageType.GET_STATES:
        sendResponse(this._controller.model.states);
        break;
      default:
        console.error("No handler", message.type);
    }

    return true;
  }

  processExternal(
    msg: IMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (responseData?: any) => void ) {
    
    switch (msg['type']) {
      case MessageType.INSTALLED:
        let { id } = sender;
        id && this._controller.updateGlobalState(GlobalState.remoteExtId, id);
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

  /** @todo */
  processConnectMessage(msg: IMessage, port: chrome.runtime.Port) {
    switch(msg['type']) {
      case MessageType.CLEAR:
        return this._controller.model.clear();
      case MessageType.TOGGLE_LANGUAGE_STATE:
        let { value } = msg['data'] || true;
        return this._controller.updateState('lang', value);
      case MessageType.VISIBILITY:
        return this._controller.visibility = msg['data'].value;
    }
  }

  processConnect(port: chrome.runtime.Port) {
    this._controller.vkPort = port;
    port.onMessage.addListener(this.processConnectMessage.bind(this));
  }
}
