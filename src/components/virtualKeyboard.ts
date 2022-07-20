import { html, LitElement } from "lit";

import { customElement, property } from "lit/decorators.js";
import { virtualKeyBoardStyles } from "../view/pages";


const keyList = [
  // [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 59, 45, 43, 8],
  ['`', 1, 2,  3,  4,  5,  6,  7,  8,  9,  0,  '-', '+', 'Backspace'],
  ['Tab', 'q', 'w', 'e',  'r', 't',    'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  // [9,     113, 119, 101, 114, 116, 121, 117, 105, 110, 112, 91, 93, 92],
  ['cmd', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter'],
  // []
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  // [],
  ['ctrl', 'alt', 'space', 'alt', 'ctrl']
]

const specificList = {
  [keyList[0].slice(-1)[0]]: '60pt',
  [keyList[1][0]]: '60pt',
  [keyList[2][0]]: '78pt',
  [keyList[2].slice(-1)[0]]: '78pt',
  [keyList[3][0]]: '103.5pt',
  [keyList[3].slice(-1)[0]]: '103.5pt',
  [keyList[4][0]]: '96pt',
  [keyList[4][1]]: '96pt',
  [keyList[4][2]]: '325pt'

}

@customElement('virtual-keyboard')
export class VirtualKeyboard extends LitElement {
  
  static styles = virtualKeyBoardStyles;

  getId(value: any) {
    return 'id-' + value;
  }

  getSpecificKeyWidth(key: any) {
    return key in specificList ? `width: ${specificList[key]}` : "";
  }

  render() {
    return html`
<div class="container container-vertical vk-box" id="kbd" tabindex="-1" style="user-select: none;">
    ${keyList.map((row) => {
      return html`
    <div style="white-space: nowrap;">
          ${row.map((key) => {
            return html`
      <button .id=${this.getId(key)} type="button" class="vk-btn" disabled=true .style="user-select: none; ${this.getSpecificKeyWidth(key)}">
        <span class="vk-cap">${key}</span>
      </button>`
          })}
    </div>`
    })}
    `;     
  }
}