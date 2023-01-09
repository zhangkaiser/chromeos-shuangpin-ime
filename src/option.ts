import { html, LitElement, TemplateResult } from  "lit";
import { customElement, property, state } from "lit/decorators.js";

import { InputToolCode, MessageType, StateID } from "./model/enums";
import { solutions } from "./model/shuangpinSolutions";

import { optionPageStyles } from "./view/pages";
import { IIMEState, IIMEStateKeyUnion, ILocalStorageOfGlobalState } from "./model/state";

const inputToolCodes = [
  {
    id: "zh-wasm-shuangpin",
    name: "双拼输入法"
  },
  {
    id: "zh-wasm-pinyin",
    name: "拼音输入法"
  }
]

const introList = [
  {
    label: '中英文输入切换',
    value: 'Shift键'
  },
  {
    label: '标点符号半／全角转换',
    value: 'Ctrl + ;'
  },
  {
    label: '中文英文标点符号切换',
    value: 'Ctrl + 标点(.)'
  },
  {
    label: '繁体字输出转换',
    value: 'Ctrl + 逗号(,)'
  }
];

const descList = [
  {
    desc: "设置状态后可能需要重启扩展才能生效。"
  },
  {
    desc: "无法单独使用，需要与zhime ui扩展一起使用。"
  },
  {
    desc: "当前版本支持40万+词库(精准度80%左右)+用户选词自学习" 
  },
  {
    desc: "现在仍然有一些错误需要修复。"
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

const baseEditList: Partial<Record<IIMEStateKeyUnion, ["checkbox" | "text" | "number", string]>> = {
  sbc: ['checkbox', '设置字符宽度为全角'],
  lang: ['checkbox', "中文输出模式"],
  punc: ['checkbox', "设置字符宽度为半角"],
  vertical: ['checkbox', "使用纵向显示候选词列表"],
  traditional: ['checkbox', "启用繁体字输出"],
  // selectKeys: ['text', "选词按键"],
  pageSize: ['number', "设置候选词长度"]
}


@customElement('option-page')
class OptionPage extends LitElement {

  @state({
    hasChanged(value, oldValue) {
      console.log(value, oldValue);
      return true;
    }
  }) globalState = {};
  @state({
    hasChanged(value, oldValue) {
      return true;
    },
  }) states: Partial<IIMEState> = {};
  
  constructor() {
    super();

    // Load states.

    chrome.runtime.sendMessage({
      data: {
        type: "getStates",
        value: ["states", "globalState"]
      }
    }, (res) => {
      if (res['globalState']) {
        this.globalState = res['globalState'];
      }
      if (res['states']) {
        this.states = res['states'];
      }
    });
  }

  updateState(name: string, value: any, isGlobalState = false) {
    let type = isGlobalState 
      ? "setGlobalStates"
      : "setStates"
    chrome.runtime.sendMessage({
      data: {
        type,
        value: [name, value]
      }
    });
  }

  // 
  onClickCheckbox(e: Event) {
    let target = e.target as HTMLInputElement;
    let {id, checked} = target;
    this.updateState(id, checked);
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

  onSelectionChanged(e: Event) {
    let target = e.target as HTMLSelectElement;
    let { id, value } = target;
    let isGlobalState = false;

    if (id in this.globalState) {
      isGlobalState = true;
      this.globalState = {
        ...this.globalState,
        [id]: value
      };
    } else {
      (this.states as any)[id] = value;
    }

    this.updateState(id, value, isGlobalState);
  }

  onInputChanged(e: Event) {
    let target = e.target as HTMLInputElement;
    let {id, value, checked} = target;
    if (!id) return;
    if ((baseEditList as any)[id][0] === "checkbox") {
      this.updateState(id, checked);
    } else {
      if (id === "pageSize") value = (+value) as any;
      this.updateState(id, value);
    }
  }

  onClickBtns(ev: Event) {
    let target = ev.target as HTMLButtonElement;
    if (target.id === "reload") {
      alert("正在重启扩展");
      chrome.runtime.reload();
    }
    if (target.id === "clean") {
      chrome.storage.local.clear(() => {
        alert("配置信息清除成功。")
      });
    }
  }

  static styles = optionPageStyles;

  baseSetting() {
    return html`
<div>
  <section>
    <h3>基础设置</h3>
    <div class="buttons" @click=${this.onClickBtns}>
      <button class="btn-1" id="reload">重启扩展</button>
      <button class="btn-1" id="clean">清空状态缓存</button>
    </div>
    <div>
      <span class="controlled-setting-with-label">
        <span class="selection-label">
          <label for="inputToolCode">切换输入法</label>
        </span>
        <select @change=${this.onSelectionChanged} id="inputToolCode" class="chos-option-item">
          ${inputToolCodes.map((item) => {
            return html`
              <option value="${item['id']}" ?selected=${item['id'] === (this.globalState as any).inputToolCode}>
                ${item['name']}
              </option>
            `
          })}
        </select>
      </span>
    </div>
    <div ?hidden=${(this.globalState as any)['inputToolCode'] !== "zh-wasm-shuangpin"}>
      <span class="controlled-setting-with-label">
        <span class="selection-label">
          <label for="shuangpin-solutions">双拼解决方案</label>
        </span>
        <select @change=${this.onSelectionChanged} id="shuangpinSolution" class="chos-option-item">
          ${Object.keys(solutionNames).map((item) => {
            return html`
              <option value="${item}" ?selected=${item === this.states.shuangpinSolution}>${solutionNames[item as keyof typeof solutionNames]}</option>
            `
          })}
        </select>
      </span>
    </div>
    ${this.states && Object.entries(baseEditList).map((item) => {
      return html`
        <div>
          <span class="controlled-setting-with-label">
            <span>
              <label .for=${item[0]}>${item[1][1]}</label>
            </span>
            ${
              item[1][0] === "checkbox"
                ? html`<input @click=${this.onInputChanged} type="checkbox" ?checked=${this.states[item[0] as keyof IIMEState]} .id="${item[0]}">`
                : html`<input @change=${this.onInputChanged} .type=${item[1][0]} .value=${this.states[item[0] as keyof IIMEState]} .id="${item[0]}">`
            }
          </span>
        </div>
      `;
    })}
  </section>
</div>
  `
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'option-page': OptionPage
  }
}