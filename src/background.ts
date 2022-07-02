import { Controller } from "./controller";
import { configFactoryInstance } from "./model/configfactory";
import { EventType, InputToolCode, StateID } from "./model/enums";
import { OnlineState } from "./model/state";
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
    chrome.storage.sync.set({
      config: this._controller.localConfig
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
      this.#updateSettingsFromLocalStorage();
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
      this._controller.switchInputToolState(engineID, name as StateID);
    });
    
    chrome.input.ime.onInputContextUpdate.addListener(() => {

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
   * @todo
   * Updates settings from local storage.
   */
  #updateSettingsFromLocalStorage() {
    chrome.storage.sync.get('config', (res) => {
      if (!res || !res['config']) return ;
      let config = res['config'];
      
      let currentConfig = this.configFactory.getCurrentConfig();

      // Set the current shuangpin solution.
      currentConfig.setSolution(config['solution']);

      // Set SBC/PUBC states.
      currentConfig.states[StateID.SBC].value = config?.chos_init_sbc_selection;
      currentConfig.states[StateID.PUNC].value = config?.chos_init_punc_selection;

      // Set custom states.
      currentConfig.enableVertical = config?.chos_init_vertical_selection ?? false;

      // Simplified Chinese to Traditional Chinese enable status.(hans2hanz)
      currentConfig.enableTraditional = config?.chos_init_enable_traditional ?? false;
      if (currentConfig.enableTraditional) {
        // Load Chinese Traditional dict.
        loadDict();
      }

      // Online decoder enable status.
      if (Reflect.has(config, 'onlineStatus')) {
        OnlineState.onlineStatus = config.onlineStatus;
        OnlineState.onlineEngine = config?.onlineEngine;
      }

      // Cache the current status.
      this._controller.localConfig = config;
    });
  }

  /**
   * Processes incoming requests from option page.
   */
  processRequest(
    message: any, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response?: any) => void ) {
    if (message['update']) {
      chrome.storage.sync.set({ config: message['config']});
    }
  }
}

new Background();