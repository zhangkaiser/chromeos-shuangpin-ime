import { Status } from "../model/enums";
import { Model } from "../model/model";
import type { ViewModel } from "./viewmodel";

export class ShuangpinModel extends Model implements IShuangpinModel {
  config = this.configFactory;

  context?: chrome.input.ime.InputContext;

  rawChar = '';

  constructor(
    public engineID: string,
    private setData:(data: DataRenderInterface) => void) {
    super();
    this.config.setInputTool(engineID);
  }

  setMenus() {
    let states = this.config.getCurrentConfig().states;
    let menuItems = [];
    for (let key in states) {
      menuItems.push({
        'id': key,
        'label': states[key].desc,
        'checked': states[key].value,
        'enabled': true,
        'visible': true
      })
    }

    this.setData({
      menuItems: {
        engineID: this.engineID,
        items: menuItems
      }
    });
  }

  updateSource(text: string) {
    this.rawChar += text;  
    super.updateSource(text);
  }

  clear() {
    this.rawChar = '';
    super.clear();
  }

  /**
   * Aborts the model, the behavior may be overridden by sub-classes.
   */
  abort() {
    super.abort();
    this.config.setInputTool('');
  }

  fetchCandidates() {
    super.fetchCandidates()
  }
}