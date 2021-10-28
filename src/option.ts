import { html, css, LitElement } from  "lit";
import { customElement, property } from "lit/decorators.js";
import { solutionNames } from "./utils/double-solutions";

@customElement('option-page')
class OptionPage extends LitElement {

  constructor() {
    super();
    chrome.storage.sync.get('config', (res) => {
      if (res && res['config']) {
        let config = this.config = res['config'];
        if (Reflect.has(config, 'solution')) {
          this.currentSolution = config['solution']
        }

        for (let item of this.baseInfo) {
          if (Reflect.has(config, item['id'])) {
            item['value'] = config[item['id']]
          }
        }
        this.loaded = true;
      }
    })
  }

  config:any = {
    solution: 'pinyinjiajia',
    
  };
  
  shortcuts = [
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
    }
  ]
  solutions:Record<string, string> = solutionNames
  @property({type: String}) currentSolution = 'pinyinjiajia';
  @property({type: Boolean}) loaded = false;

  @property({type: Array})
  baseInfo = [
    {
      id: 'chos_prev_page_selection',
      type: 'checkbox',
      value: true,
      label: '用“-”键和“=”键在候选字词列表中翻页'
    },
    {
      id: 'chos_next_page_selection',
      type: 'checkbox',
      value: true,
      label: '用“,”键和“.”键在候选字词列表中翻页'
    },
    {
      id: 'chos_init_sbc_selection',
      type: 'checkbox',
      value: false,
      label: '初始字符宽度为全角'
    },
    {
      id: 'chos_init_punc_selection',
      type: 'checkbox',
      value: true,
      label: '初始标点符号宽度为全角'
    },
    {
      id: 'chos_init_vertical_selection',
      type: 'checkbox',
      value: false,
      label: '纵向显示候选词列表'
    },
    {
      id: 'chos_init_enable_traditional',
      type: 'checkbox',
      value: false,
      label: '启用繁体字'
    },
  ]

  changeConfig() {
    chrome.storage.sync.set({
      config: this.config
    })
  }

  handleEvent(e: Event) {
    let id = (e.target as Element).id;
    if (id && id === 'shuangpin-solutions') {
      this.config['solution'] = (e.target as HTMLSelectElement).value;
      
      this.changeConfig()
    } else if (id) {
      this.config[id] = !this.config[id]
      this.changeConfig()
    }
  }

  static styles = css`
  .chos-group-div {
    margin-left: 20px;
    margin-right: 150px;
  }
  
  .chos-group-div-left {
    float: left;
    margin-right: 50px;
  }
  
  :host {
    color: rgb(48, 57, 66);
    font: 75% 'Segoe UI', Arial, Meiryo, 'MS PGothic', sans-serif;
    max-width:640px;
  }
  
  input[type='checkbox'] {
    -webkit-appearance: none;
    background-image: -webkit-linear-gradient(#ededed, #ededed 38%, #dedede);
    border: 1px solid rgba(0, 0, 0, .25);
    border-radius: 2px;
    bottom: 2px;
    box-shadow: 0 1px 0 rgba(0, 0, 0, .08),
        inset 0 1px 2px rgba(255, 255, 255, .75);
    color: #444;
    font: inherit;
    height: 13px;
    margin: 4px 1px 0 0;
    position: relative;
    -webkit-user-select: none;
    text-shadow: 0 1px 0 rgb(240, 240, 240);
    vertical-align: middle;
    width: 13px;
  }
  
  input[type='checkbox']:checked::before {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAcklEQVQY02NgwA/YoJgoEA/Es4DYgJBCJSBeD8SboRinBiYg7kZS2IosyQ/Eakh8LySFq4FYHFlxGRBvBOJYqMRqJMU+yApNkSRAeC0Sux3dfSCTetE0wKyXxOWhMKhTYIr9CAUXyJMzgLgBagBBgDPGAI2LGdNt0T1AAAAAAElFTkSuQmCC);
    background-size: 100% 100%;
    content: '';
    display: block;
    height: 100%;
    -webkit-user-select: none;
    width: 100%;
  }
  
  input[type='checkbox']:disabled {
    opacity: .75;
  }
  
  input[type='button'] {
    -webkit-appearance: none;
    background-image: -webkit-linear-gradient(#ededed, #ededed 38%, #dedede);
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 2px;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 0.75);
    color: #444;
    font: inherit;
    margin: 0 1px 5px 0;
    min-height: 2em;
    min-width: 4em;
    padding-bottom: 1px;
    -webkit-padding-end: 10px;
    -webkit-padding-start: 10px;
    text-shadow: 0 1px 0 rgb(240, 240, 240);
    -webkit-user-select: none;
  }
  
  input[type='button']:enabled:hover {
    background-image: -webkit-linear-gradient(#f0f0f0, #f0f0f0 38%, #e0e0e0);
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12),
        inset 0 1px 2px rgba(255, 255, 255, 0.95);
    color: black;
  }
  
  input[type='button']:enabled:active {
    background-image: -webkit-linear-gradient(#e7e7e7, #e7e7e7 38%, #d7d7d7);
    box-shadow: none;
    text-shadow: none;
  }
  
  input[type='button']:disabled {
    background-image: -webkit-linear-gradient(#f1f1f1, #f1f1f1 38%, #e6e6e6);
    border-color: rgba(80, 80, 80, 0.2);
    box-shadow: 0 1px 0 rgba(80, 80, 80, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 0.75);
    color: #aaa;
  }
  
  label {
    display: inline;
    padding: 0;
    cursor: default;
  }
  
  label:hover {
    color: black;
  }
  
  h1 {
    display: block;
    font-size: 1.5em;
    font-weight: normal;
    line-height: 1;
    margin: 0;
    -webkit-margin-after: .67em;
    -webkit-margin-before: .67em;
    -webkit-margin-end: 0;
    -webkit-margin-start: 0;
    padding: 1px 0 13px;
    -webkit-user-select: none;
  }
  
  h1::after {
    background-color: #eee;
    content: ' ';
    display: block;
    height: 1px;
    -webkit-margin-end: 20px;
    position: relative;
    top: 13px;
  }
  
  h3 {
    color: black;
    font-size: 1.2em;
    font-weight: normal;
    line-height: 1;
    margin-bottom: .8em;
    -webkit-margin-start: -18px;
    -webkit-user-select: none;
  }
  
  section {
    margin: 8px 0 24px;
    max-width: 600px;
    -webkit-padding-start: 20px;
  }
  
  select {
    -webkit-appearance: none;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAICAYAAAAbQcSUAAAAaUlEQVQoz2P4//8/A7UwdkEGhiggTsODo4g2LBEImJmZvwE1/UfHIHGQPNGGAbHCggULFrKxsf1ENgjEB4mD5EnxJoaByAZB5Yk3DNlAPj6+L8gGkWUYzMC3b982IRtEtmFQjaxYxDAwAGi4TwMYKNLfAAAAAElFTkSuQmCC),
        -webkit-linear-gradient(#ededed, #ededed 38%, #dedede);
    background-position: right center;
    background-repeat: no-repeat;
    border: 1px solid rgba(0, 0, 0, .25);
    border-radius: 2px;
    box-shadow: 0 1px 0 rgba(0, 0, 0, .08), inset 0 1px 2px rgba(255, 255, 255, .75);
    color: #444;
    font: inherit;
    margin: 0 1px 0 0;
    min-height: 2em;
    min-width: 240px;
    padding-bottom: 1px;
    -webkit-padding-end: 20px;
    -webkit-padding-start: 6px;
    text-shadow: 0 1px 0 rgb(240, 240, 240);
    -webkit-user-select: none;
  }
  
  select:disabled {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAICAYAAAAbQcSUAAAAWklEQVQoz2P4//8/A7UwdkEGhiggTsODo4g2LBEIGhoa/uPCIHmiDQNihQULFizEZhBIHCRPijexGggzCCpPvGHoBiIbRJZhMAPfvn3bhGwQ2YZBNbJiEcPAAIgGZrTRc1ZLAAAAAElFTkSuQmCC),
        -webkit-linear-gradient(#f1f1f1, #f1f1f1 38%, #e6e6e6);
    border-color: rgba(80, 80, 80, .2);
    box-shadow: 0 1px 0 rgba(80, 80, 80, .08), inset 0 1px 2px rgba(255, 255, 255, .75);
    color: #aaa;
  }
  
  option {
    font: inherit;
    font-weight: normal;
  }
  
  footer {
    border-top: 1px solid #eee;
    -webkit-margin-end: 20px;
    margin-top: 16px;
    padding: 8px 0;
    text-align: right;
  }
  
  embed {
    display: block;
  }
  
  .controlled-setting-with-label {
    -webkit-box-align: center;
    display: -webkit-box;
    padding-bottom: 7px;
    padding-top: 7px;
  }
  
  .controlled-setting-with-label > input + span {
    -webkit-box-align: center;
    -webkit-box-flex: 1;
    display: -webkit-box;
    -webkit-margin-start: .6em;
  }
  
  .controlled-setting-with-label > input:disabled + span label {
    color: #999;
  }
  
  .controlled-setting-with-label label {
    display: inline;
    padding: 0;
  }
  
  .controlled-setting-with-desc-label {
    -webkit-box-align: center;
    -webkit-margin-start: 1.8em;
    color: #999;
    display: -webkit-box;
    padding-bottom: 7px;
  }
  
  .selection-label {
    display: -webkit-box;
    width: 230px;
  }
  
  .overlay {
    background-color: rgba(255, 255, 255, 0.75);
    bottom: 0;
    -webkit-box-align: center;
    -webkit-box-orient: vertical;
    -webkit-box-pack: center;
    display: -webkit-box;
    left: 0;
    overflow: auto;
    padding: 20px;
    position: fixed;
    right: 0;
    top: 0;
    -webkit-transition: 200ms opacity;
    visibility:hidden;
    z-index: 11;
  }
  
  .overlay_page {
    background: white;
    background-color: white;
    -webkit-border-radius: 3px;
    -webkit-box-orient: vertical;
    box-shadow: 0 4px 23px 5px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0,0,0,0.15);
    color: #333;
    display: -webkit-box;
    padding: 10px;
    position: relative;
    -webkit-transition: 200ms -webkit-transform;
    -webkit-user-select: none;
    z-index: 0;
  }
  
  .user_dict_entry {
    padding: 5px;
  }
  
  .user_dict_entry:hover {
    background-color: rgb(187, 206, 233);
  }
  
  .user_dict_entry_x {
    background-color: transparent;
    background-image: -webkit-image-set(
        url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAiElEQVR42r2RsQrDMAxEBRdl8SDcX8lQPGg1GBI6lvz/h7QyRRXV0qUULwfvwZ1tenw5PxToRPWMC52eA9+WDnlh3HFQ/xBQl86NFYJqeGflkiogrOvVlIFhqURFVho3x1moGAa3deMs+LS30CAhBN5nNxeT5hbJ1zwmji2k+aF6NENIPf/hs54f0sZFUVAMigAAAABJRU5ErkJggg==) 1x,
        url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAA9UlEQVR4Xu3UsWrCUByH0fMEouiuhrg4xohToJVGH0CHLBncEwfx/VvIFHLJBWmHDvKbv7PcP9f3L/fXwBsApZSRpUpEgbOnxwiReng6x4AvjdrNXRLkibubWqMcB9Yujk7qjhjmtZOji/U4wELuoBwQXa50kFsQA5jK+kQ/l5kSA4ZEK5Fo+3kcCIlGM8ijQEhUqkEeBUKiUPTyl4C5vZ1cbmdv/iqwclXY6aZwtXoFSLQqhVwmkytUWglxAMG7T0yCu4gD0v7ZBKeVxoEwFxIxYBPmIWEzDnyEeUj4HAfYdvmMcGYdsSUGsOzlIbHEv/uV38APrreiBRBIs3QAAAAASUVORK5CYII=) 2x);
    border: none;
    display: block;
    float: right;
    height: 16px;
    opacity: 1;
    -webkit-transition: 150ms opacity;
    width: 16px;
  }
  
  .user_dict_entry_x:hover {
    background-image: -webkit-image-set(
        url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAqklEQVR4XqWRMQ6DMAxF/1Fyilyj2SmIBUG5QcTCyJA5Z8jGhlBPgRi4TmoDraVmKFJlWYrlp/g5QfwRlwEVNWVa4WzfH9jK6kCkEkBjwxOhLghheMWMELUAqqwQ4OCbnE4LJnhr5IYdqQt4DJQjhe9u4vBBmnxHHNzRFkDGjHDo0VuTAqy2vAG4NkvXXDHxbGsIGlj3e835VFNtdugma/Jk0eXq0lP//5svi4PtO01oFfYAAAAASUVORK5CYII=) 1x,
        url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAB4UlEQVR42u2VsWoCQRBAh+MUFP0C1V9QD4NEOxs9xBQHQVCwSJFWVBAtBNXCxk6wTkBJYUTwEwQLC61E8QP0NzZzt5g5726DkC7EYWHZ8T3WndkV2C/jLwn4hwVYBIdLn9vkLp79QcBCTDMiy3w2gQ9XeTYkEHA8vqj2rworXu3HF1YFfSWgp5QFnKVLvYvzDEKEZ5hW70oXOCtcEbQLIkx7+IQtfMBSOjU6XEF4oyOdYInZbXyOuajjDlpNeQgleIUJKUz4BDMledhqOu/AzVSmzZ49CUjCC0yvim98iqtJT2L2jKsqczsdok9XrHNexaww415lnTNwn6CM/KxJIR8bnUZHPhLO6yMoIyk2pNjLewFuE5AiY1KMMQx8Q7hQYFek4AkjxXFe1rsF84I/BTFQMGL+1Lxwl4DwdtM1gjwKohgxyLtG7SYpxALqugOMcfOKN+bFXeBsLB1uulNcRqq7/tt36k41zoL6QlxGjtd6lrahiqCi1iOFYyvXuxY8yzK33VnvUivbLlOlj/jktm0s3YnXrNIXXufHNxuOGasi8S68zkwrlnV8ZcJJsTIUxbLgQcFZWE8N0gau2p40VVcM0gYeFpSRK6445UhBuKiRgiyKw+34rLt59nb1/7+RwReVkaFtqvNBuwAAAABJRU5ErkJggg==) 2x);
  }
  
  .user_dict_entry_x:active  {
    background-image: -webkit-image-set(
        url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAARElEQVQoz2P4z4AfMlBLAYMdwxkghgEwD1XBGTC0g0sDIaYJECVwFqoChBK4WegKkJWArSJZAQErCDqSKG/iCyhaRhYA9LDIbULDzlIAAAAASUVORK5CYII=) 1x,
        url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAA/ElEQVR4Xu3UsWrCUBiG4efGlIBoIMFbcnYolYJ3pg4iKGrGYFTRwaUFhYAekiDt0EG++X2W83N8/3J/DbwBMJJSsdQItcDY1VlCOImzq3Ed8OmicHASB3ns5KBw8VUNpDJrW7uAiJ3sbK1l0mqArpmFTUlQ5jYWZrrUAUSmT0SZm4qoA56JvVhs/5g3A7RLolA85A1ASOTye65NMxASK6syfxGITMzvMxG9CvRkliWwlOm9AsSOcitzU1NzK7mjuBkQvHtLK7iLBiB5PhttJSGpB8I8vM6kDuiHeUjoVwMfYR4SRtUAw1veIZzOjRhSBzCoyKFjgH/3K7+BHzg+Cgw0eSW3AAAAAElFTkSuQmCC) 2x);
  }
  
  .user_dict_entries {
    background-color: rgb(235, 239, 249);
    border: solid 1px rgb(217, 217, 217);
    padding: 5px;
  }
  
  .user_dict_existing {
    max-height: 150px;
    overflow-y: auto;
  }
  
  #chos_manage_user_dict_new_input {
    width: 225px;
  }
  
  #chos_manage_user_dict_add_input {
    margin-left: 5px;
  }
  
  #chos_manage_user_dict_save {
    margin-top: 10px;
  }
  
  `;

  render() {
    return html`
      <header><h1>双拼设置页面</h1><header>
      <div>
        <section>
          <h3>基础设置</h3>
          <div>
            <span class="controlled-setting-with-label">
              <span class="selection-label">
                <label for="shuangpin-solutions">双拼解决方案</label>
              </span>
              <select @change=${this.handleEvent} id="shuangpin-solutions" class="chos-option-item">
                ${Object.keys(this.solutions).map((item) => {
                  return html`
                    <option value="${item}" ?selected=${item === this.currentSolution}>${this.solutions[item]}</option>
                  `
                })}
              </select>
            </span>
          </div>
          ${this.baseInfo.map((item) => {
            return html`
              <div>
                <span class="controlled-setting-with-label">
                  <input @click=${this.handleEvent} .type=${item.type} ?checked=${item.value} .id=${item.id}>
                  <span>
                    <label .for=${item.id}>${item.label}</label>
                  </span>
                </span>
              </div>
            `;
          })}
        </section>
      </div>
      <div>
        <section>
          <h3>快捷键</h3>
          ${this.shortcuts.map((item) => {
            return html`
              <div>
                <span class="controlled-setting-with-label">
                  <span class="selection-label">
                   <label>${item.label}</label>
                  </span>
                  <span style="background: #f2f2f2;padding: 4px 8px;border-radius: 4px;">
                    ${item.value}
                  </span>
                </span>
              <div>
            `
          })}
        </section>
      </div>
    `;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'option-page': OptionPage
  }
}