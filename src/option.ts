import { html, LitElement, TemplateResult } from  "lit";
import { customElement, property } from "lit/decorators.js";

import { PredictEngine } from "./model/enums";
import type { IMessage } from "./model/common";
import { MessageType, StateID } from "./model/enums";
import { solutions } from "./model/shuangpinSolutions";

import "./components/virtualKeyboard";

import { optionPageStyles } from "./view/pages";
import { IIMEState, IIMEStateKey } from "./model/chineseconfig";

const codeRegExp = /[?code=.]zh-(js|wasm)-(shuangpin|pinyin)/i

const introList = [
  {
    label: '中英文输入切换',
    value: 'Alt + 空格键'
  },
  {
    label: '字符宽度为全角输入',
    value: 'Shift + 空格键'
  },
  {
    label: '标点符号中英文模式切换',
    value: 'Ctrl + .'
  },
  {
    label: '用“-/=”键 or “,/.”键翻页',
    value: ['- / =', ', / .']
  },
  {
    label: 'Shuang Pin solution',
    value: {
      link: "#shuangpin-solution"
    }
  },
  {
    label: "How to add shuangpin solution",
    value: {
      link: "#custom-shuangpin"
    }
  }
];

const solutionNames: Record<keyof typeof solutions, string> = {
  pinyinjiajia: "aa",
  pinyinjiajia_o: "aa",
  ziranma: "aa",
  ziranma_o: "aa",
  zhongwenzhixing_o: "aa",
  xiaohe_o: "aa",
  xiaohe: "aa"
}

const onlineEngineList: Record<PredictEngine, string> = {
  [PredictEngine.BAIDU]: '百度(不支持中英文混合输入)',
  [PredictEngine.GOOGLE]: '谷歌全球(不支持中国大陆区域)',
  [PredictEngine.GOOGLE_CN]: '谷歌中国(支持中国大陆区域中英文混输)'
}


const baseList = [
  {
    id: StateID.SBC,
    type: 'checkbox',
    label: '初始字符宽度为全角'
  },
  {
    id: StateID.PUNC,
    type: 'checkbox',
    label: '初始标点符号宽度为全角'
  },
  {
    id: 'enableVertical',
    type: 'checkbox',
    label: '纵向显示候选词列表'
  },
  {
    id: 'enableTraditional',
    type: 'checkbox',
    label: '启用繁体字'
  }
];


/**
 * @todo so messy!
 */
@customElement('option-page')
class OptionPage extends LitElement {
  
  compiler = "js";
  decoder = "pinyin";

  // Corresponding state key.
  requireUpdateFields: Partial<Record<IIMEStateKey, boolean>> = {
    shuangpinSolution: true,
    predictEngine: true,
  } 
  
  constructor() {
    super();
    let codes = window.location.search.match(codeRegExp);
    if (codes) {
      this.compiler = codes[1];
      this.decoder = codes[2];
    }

    // Load states.
    chrome.runtime.sendMessage({
      type: MessageType.GET_STATES,
      inputToolCode: this.inputCode,
      data: null,
      time: Date.now()
    } as IMessage, (states) => {
      if (!states) throw Error("Load states error!");
      this.states = states;
      this.loaded = true;
    })
  }

  states?: IIMEState;

  updateState(name: string, value: any) {
    chrome.runtime.sendMessage({
      type: MessageType.UPDATE_STATE,
      inputToolCode: this.inputCode,
      data: {
        name,
        value
      },
      time: Date.now()
    } as IMessage, () => {
      if (name in this.requireUpdateFields) {
        return (this as any)[name] = value;
      }
    });
  }

  get inputCode() {
    return `zh-${this.compiler}-${this.decoder}`;
  }
  
  @property({type: String}) shuangpinSolution = 'pinyinjiajia';
  @property({type: Number}) onlineEngine = 0;
  @property({type: Boolean}) onlineStatus = true;
  @property({type: Boolean}) loaded = false;
  @property() showCustomShuangpin = false;


  // 
  onClickCheckbox(e: Event) {
    let target = e.target as HTMLInputElement;
    let {id, value} = target;
    this.updateState(id, value);
  }

  onChooseEngine(e: Event) {
    let target = e.target as HTMLSelectElement;
    let { value } = target;
    this.updateState('onlineEngine', +value);
  }

  onChooseShuangpin(e: Event) {
    let target = e.target as HTMLSelectElement;
    let { value } = target;
    this.updateState('shuangpinSolution', value);
  }

  static styles = optionPageStyles;

  baseSetting() {
    return html`
<div>
  <section>
    <h3>基础设置</h3>
    <div>
      <span class="controlled-setting-with-label">
        <span class="selection-label">
          <label for="shuangpin-solutions">双拼解决方案</label>
        </span>
        <select @change=${this.onChooseShuangpin} id="shuangpin-solutions" class="chos-option-item">
          ${Object.keys(solutionNames).map((item) => {
            return html`
              <option value="${item}" ?selected=${item === this.shuangpinSolution}>${solutionNames[item as keyof typeof solutionNames]}</option>
            `
          })}
        </select>
        <!-- TODO -->
        <span><a href="#herf">See solution</a></span>
      </span>
    </div>
    ${this.states && baseList.map((item) => {
      return html`
        <div>
          <span class="controlled-setting-with-label">
            <input @click=${this.onClickCheckbox} .type=${item.type} ?checked=${this.states![item.id as keyof IIMEState]} .id=${item.id}>
            <span>
              <label .for=${item.id}>${item.label}</label>
            </span>
          </span>
        </div>
      `;
    })}
  </section>
</div>
  `
  }

  onlineSetting() {
    return html`
<div>
  <section>
    <h3>在线解析</h3>
    <div>
      <span class="controlled-setting-with-label">
        <input @click=${this.onClickCheckbox} type="checkbox" ?checked=${this.onlineStatus}>
        <span>
          <label>启用</label>
        </span>
      </span>
    </div>
    <div ?hidden=${!this.onlineStatus}>
      <span class="controlled-setting-with-label">
        <span class="selection-label">
          <label for="shuangpin-solutions">在线解析器引擎</label>
        </span>
        <select @change=${this.onChooseEngine} id="online-solutions" class="chos-option-item">
          ${Object.entries(onlineEngineList).map((item) => {
            return html`
              <option value=${item[0]} ?selected=${Number(item[0]) === this.onlineEngine}>${item[1]}</option>
            `
          })}
        </select>
      </span>
    </div>
  </section>
</div>
    `
  }

  customShuangpin() {
    return this.showCustomShuangpin ? html`
<button>aa</button>
    ` : "";
  }


  handleIntroItem(value: string | string[] | {
    link: string
  }): TemplateResult | TemplateResult[] {
    if (typeof value === 'string') {
      return html`
<span class="s-tag">${value}</span>
      `;
    } else if (Array.isArray(value)) {
      return value.map((item, index) => html`
<span class="s-tag">${value}</span>
      `);
    } else {
      // if (value.link) {
      // }
      return html`
<a href="${value.link}"></a>
      `;
    }
  }


  moreIntro() {
    return html`
<div>
  <section>
    <h3>Description</h3>
    ${introList.map((item) => {
      return html`
        <div>
          <span class="controlled-setting-with-label">
            <span class="selection-label">
              <label>${item.label}</label>
            </span>
            ${this.handleIntroItem(item.value)}
          </span>
        <div>
      `
    })}
  </section>
</div>
    `
  }

  render() {
    return html`
<header><h1>设置页面</h1><header>
${this.baseSetting()}
${this.onlineSetting()}
${this.moreIntro()}
<virtual-keyboard></virtual-keyboard>
    `;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'option-page': OptionPage
  }
}