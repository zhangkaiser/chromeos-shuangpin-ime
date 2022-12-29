import { html, LitElement, TemplateResult } from  "lit";
import { customElement, property } from "lit/decorators.js";

import type { IMessage } from "./model/common";
import { MessageType, StateID } from "./model/enums";
import { solutions } from "./model/shuangpinSolutions";

import { optionPageStyles } from "./view/pages";
import { IIMEState } from "./model/state";

const codeRegExp = /[?code=.]zh-(js|wasm)-(shuangpin|pinyin)/i

const introList = [
  {
    label: '中英文输入切换',
    value: 'Shift键'
  },
  {
    label: '字符宽度为全角输入',
    value: 'Ctrl + ;'
  },
  {
    label: '英文标点符号输入切换',
    value: 'Ctrl + 标点(.)'
  },
  {
    label: '使用繁体字转换输出',
    value: 'Ctrl + 逗号(,)'
  },
  {
    label: '启用在线解析器',
    value: 'Shift + 空格'
  }
];

const descList = [
  {
    desc: "当前版本支持40万+词库(精准度80%左右)+用户选词自学习" 
  },
  {
    desc: "完善了一些输入遗留问题"
  },
  {
    desc: "在线解析引擎解析延迟0.5s"
  }
]

const solutionNames: Record<keyof typeof solutions, string> = {
  pinyinjiajia: "拼音加加",
  pinyinjiajia_o: "拼音加加[o键引导]",
  ziranma: "自然码",
  ziranma_o: "自然码[o键引导]",
  zhongwenzhixing_o: "中文之星[o键引导]",
  xiaohe_o: "小鹤双拼[o键引导]",
  xiaohe: "小鹤双拼",
  zhinengabc: "智能ABC"
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
  
  compiler = "wasm";
  decoder = "pinyin";

  // Corresponding state key.
  requireUpdateFields = {
    shuangpinSolution: true,
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

      Object.keys(this.requireUpdateFields).forEach((field) => {
        if ((this.requireUpdateFields as any)[field]) {
          (this as any)[field] = states[field];
        }
      })
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
  
  @property({type: String}) shuangpinSolution = 'pinyinjiajia_o';
  @property({type: Number}) onlineEngine = 0;
  @property({type: Boolean}) onlineStatus = true;
  @property({type: Boolean}) loaded = false;
  @property() showCustomShuangpin = false;


  // 
  onClickCheckbox(e: Event) {
    let target = e.target as HTMLInputElement;
    let {id, checked} = target;
    console.log("onClickCheckbox", id, checked)
;    this.updateState(id, checked);
  }

  onChooseEngine(e: Event) {
    let target = e.target as HTMLSelectElement;
    let { value } = target;
    console.log("onClickCheckbox", value)
    this.updateState('onlineEngine', +value);
  }

  onChooseShuangpin(e: Event) {
    let target = e.target as HTMLSelectElement;
    let { value } = target;
    console.log(value);
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

  customShuangpin() {
    return this.showCustomShuangpin ? html`
<button>Test</button>
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
    <h3>快捷键</h3>
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

  moreDesc() {
    return html`
<div>
  <section>
    <h3>更多描述</h3>
      ${
      descList.map((item) => html`
        <div>
          <span class="controlled-setting-with-label">
            <label>${item.desc}</label>
          </span>
        </div>
      `)
    }
  </section>
    `
  }

  render() {
    return html`
<header><h1>设置页面</h1><header>
${this.baseSetting()}
${this.moreIntro()}
${this.moreDesc()}
<virtual-keyboard></virtual-keyboard>
    `;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'option-page': OptionPage
  }
}