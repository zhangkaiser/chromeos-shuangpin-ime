import { Controller } from "./controller";
import { IMessage } from "./model/common";
import { configFactoryInstance } from "./model/configfactory";
import { EventType, InputToolCode, MessageType, StateID } from "./model/enums";
import { IMessageDataOfUpdateState, OnlineState } from "./model/state";
import { enableDebug } from "./utils/debug";
import { loadDict } from "./utils/transform";

// enableDebug();

/**
 * The background class implements the script for the background page of chrome
 * os extension for os input tools.
 */
export class Background {

  /**
   * The controller for chrome os extension.
   */
  private _controller = new Controller();
  configFactory = configFactoryInstance;

  constructor() {
    // Sets up a listener which talks to the option page.
    chrome.runtime.onMessage.addListener(this.processRequest.bind(this));
    
    this.#init();

    this._controller.addEventListener(
      EventType.UPDATESTATE, 
      this.#updateStateToStorage.bind(this)
    );
  }

  #updateStateToStorage() {
    let states = this._controller.model.states;
    chrome.storage.local.set({
      states
    })
  }

  /** Initializes the background scripts. */
  #init() {
    chrome.runtime.onInstalled.addListener((res) => {
      if (res.reason === 'install') {
        // The default input tool configure.
        this.#updateStateToStorage();
      }
    })

    chrome.input.ime.onActivate.addListener((engineID) => {
      this.#restoreState();
      this._controller.activate(engineID as InputToolCode);
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
   * Restore the state from cached.
   */
  #restoreState() {
    chrome.storage.local.get('states', (res) => {
      if (res && res['states']) {
        this._controller.model.setStates(res["states"]);
        if (res["states"].enableTraditional) {
          // Early Loading Chinese Traditional dict.
          loadDict();
        }
      }
    });
  }

  /**
   * Processes incoming requests from option page.
   */
  processRequest(
    message: IMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (responseData?: any) => void ) {
    
    switch (message['type']) {
      case MessageType.UPDATE_STATE:
        let data = <IMessageDataOfUpdateState>message.data;
        this._controller.updateState(data.state, data.value);
        sendResponse(true);
        return true;
      case MessageType.GET_STATES:
        sendResponse(this._controller.model.states);
        return true;
    }
  }
}

new Background();