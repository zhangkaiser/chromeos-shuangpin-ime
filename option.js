/*! For license information please see option.js.LICENSE.txt */
(()=>{"use strict";const t=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,e=Symbol(),i=new Map;class s{constructor(t,i){if(this._$cssResult$=!0,i!==e)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){let e=i.get(this.cssText);return t&&void 0===e&&(i.set(this.cssText,e=new CSSStyleSheet),e.replaceSync(this.cssText)),e}toString(){return this.cssText}}const n=t=>new s("string"==typeof t?t:t+"",e),o=t?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return n(e)})(t):t;var r;const l=window.reactiveElementPolyfillSupport,a={toAttribute(t,e){switch(e){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},h=(t,e)=>e!==t&&(e==e||t==t),d={attribute:!0,type:String,converter:a,reflect:!1,hasChanged:h};class c extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(t){var e;null!==(e=this.l)&&void 0!==e||(this.l=[]),this.l.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Eh(i,e);void 0!==s&&(this._$Eu.set(s,i),t.push(s))})),t}static createProperty(t,e=d){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const n=this[t];this[e]=s,this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||d}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eh(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}o(){var t;this._$Ev=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Ep(),this.requestUpdate(),null===(t=this.constructor.l)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$Em)&&void 0!==e?e:this._$Em=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$Em)||void 0===e||e.splice(this._$Em.indexOf(t)>>>0,1)}_$Ep(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Et.set(e,this[e]),delete this[e])}))}createRenderRoot(){var e;const i=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{t?e.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):i.forEach((t=>{const i=document.createElement("style"),s=window.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=t.cssText,e.appendChild(i)}))})(i,this.constructor.elementStyles),i}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$Em)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$Em)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$Eg(t,e,i=d){var s,n;const o=this.constructor._$Eh(t,i);if(void 0!==o&&!0===i.reflect){const r=(null!==(n=null===(s=i.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==n?n:a.toAttribute)(e,i.type);this._$Ei=t,null==r?this.removeAttribute(o):this.setAttribute(o,r),this._$Ei=null}}_$AK(t,e){var i,s,n;const o=this.constructor,r=o._$Eu.get(t);if(void 0!==r&&this._$Ei!==r){const t=o.getPropertyOptions(r),l=t.converter,h=null!==(n=null!==(s=null===(i=l)||void 0===i?void 0:i.fromAttribute)&&void 0!==s?s:"function"==typeof l?l:null)&&void 0!==n?n:a.fromAttribute;this._$Ei=r,this[r]=h(e,t.type),this._$Ei=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||h)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$Ei!==t&&(void 0===this._$ES&&(this._$ES=new Map),this._$ES.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$Ev=this._$EC())}async _$EC(){this.isUpdatePending=!0;try{await this._$Ev}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach(((t,e)=>this[e]=t)),this._$Et=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$Em)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$Em)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ev}shouldUpdate(t){return!0}update(t){void 0!==this._$ES&&(this._$ES.forEach(((t,e)=>this._$Eg(e,this[e],t))),this._$ES=void 0),this._$EU()}updated(t){}firstUpdated(t){}}var p;c.finalized=!0,c.elementProperties=new Map,c.elementStyles=[],c.shadowRootOptions={mode:"open"},null==l||l({ReactiveElement:c}),(null!==(r=globalThis.reactiveElementVersions)&&void 0!==r?r:globalThis.reactiveElementVersions=[]).push("1.0.1");const u=globalThis.trustedTypes,A=u?u.createPolicy("lit-html",{createHTML:t=>t}):void 0,g=`lit$${(Math.random()+"").slice(9)}$`,b="?"+g,v=`<${b}>`,f=document,m=(t="")=>f.createComment(t),x=t=>null===t||"object"!=typeof t&&"function"!=typeof t,w=Array.isArray,_=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$=/-->/g,y=/>/g,k=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,E=/'/g,S=/"/g,C=/^(?:script|style|textarea)$/i,U=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),B=U(1),R=(U(2),Symbol.for("lit-noChange")),N=Symbol.for("lit-nothing"),Q=new WeakMap,M=f.createTreeWalker(f,129,null,!1),O=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?"<svg>":"",r=_;for(let e=0;e<i;e++){const i=t[e];let l,a,h=-1,d=0;for(;d<i.length&&(r.lastIndex=d,a=r.exec(i),null!==a);)d=r.lastIndex,r===_?"!--"===a[1]?r=$:void 0!==a[1]?r=y:void 0!==a[2]?(C.test(a[2])&&(n=RegExp("</"+a[2],"g")),r=k):void 0!==a[3]&&(r=k):r===k?">"===a[0]?(r=null!=n?n:_,h=-1):void 0===a[1]?h=-2:(h=r.lastIndex-a[2].length,l=a[1],r=void 0===a[3]?k:'"'===a[3]?S:E):r===S||r===E?r=k:r===$||r===y?r=_:(r=k,n=void 0);const c=r===k&&t[e+1].startsWith("/>")?" ":"";o+=r===_?i+v:h>=0?(s.push(l),i.slice(0,h)+"$lit$"+i.slice(h)+g+c):i+g+(-2===h?(s.push(void 0),e):c)}const l=o+(t[i]||"<?>")+(2===e?"</svg>":"");return[void 0!==A?A.createHTML(l):l,s]};class P{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const r=t.length-1,l=this.parts,[a,h]=O(t,e);if(this.el=P.createElement(a,i),M.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=M.nextNode())&&l.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith("$lit$")||e.startsWith(g)){const i=h[o++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+"$lit$").split(g),e=/([.?@])?(.*)/.exec(i);l.push({type:1,index:n,name:e[2],strings:t,ctor:"."===e[1]?V:"?"===e[1]?j:"@"===e[1]?z:L})}else l.push({type:6,index:n})}for(const e of t)s.removeAttribute(e)}if(C.test(s.tagName)){const t=s.textContent.split(g),e=t.length-1;if(e>0){s.textContent=u?u.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],m()),M.nextNode(),l.push({type:2,index:++n});s.append(t[e],m())}}}else if(8===s.nodeType)if(s.data===b)l.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(g,t+1));)l.push({type:7,index:n}),t+=g.length-1}n++}}static createElement(t,e){const i=f.createElement("template");return i.innerHTML=t,i}}function T(t,e,i=t,s){var n,o,r,l;if(e===R)return e;let a=void 0!==s?null===(n=i._$Cl)||void 0===n?void 0:n[s]:i._$Cu;const h=x(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==h&&(null===(o=null==a?void 0:a._$AO)||void 0===o||o.call(a,!1),void 0===h?a=void 0:(a=new h(t),a._$AT(t,i,s)),void 0!==s?(null!==(r=(l=i)._$Cl)&&void 0!==r?r:l._$Cl=[])[s]=a:i._$Cu=a),void 0!==a&&(e=T(t,a._$AS(t,e.values),a,s)),e}class H{constructor(t,e){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var e;const{el:{content:i},parts:s}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:f).importNode(i,!0);M.currentNode=n;let o=M.nextNode(),r=0,l=0,a=s[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new I(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new D(o,this,t)),this.v.push(e),a=s[++l]}r!==(null==a?void 0:a.index)&&(o=M.nextNode(),r++)}return n}m(t){let e=0;for(const i of this.v)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class I{constructor(t,e,i,s){var n;this.type=2,this._$AH=N,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cg=null===(n=null==s?void 0:s.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cg}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=T(this,t,e),x(t)?t===N||null==t||""===t?(this._$AH!==N&&this._$AR(),this._$AH=N):t!==this._$AH&&t!==R&&this.$(t):void 0!==t._$litType$?this.T(t):void 0!==t.nodeType?this.S(t):(t=>{var e;return w(t)||"function"==typeof(null===(e=t)||void 0===e?void 0:e[Symbol.iterator])})(t)?this.M(t):this.$(t)}A(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}S(t){this._$AH!==t&&(this._$AR(),this._$AH=this.A(t))}$(t){this._$AH!==N&&x(this._$AH)?this._$AA.nextSibling.data=t:this.S(f.createTextNode(t)),this._$AH=t}T(t){var e;const{values:i,_$litType$:s}=t,n="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=P.createElement(s.h,this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.m(i);else{const t=new H(n,this),e=t.p(this.options);t.m(i),this.S(e),this._$AH=t}}_$AC(t){let e=Q.get(t.strings);return void 0===e&&Q.set(t.strings,e=new P(t)),e}M(t){w(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new I(this.A(m()),this.A(m()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cg=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class L{constructor(t,e,i,s,n){this.type=1,this._$AH=N,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=N}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=T(this,t,e,0),o=!x(t)||t!==this._$AH&&t!==R,o&&(this._$AH=t);else{const s=t;let r,l;for(t=n[0],r=0;r<n.length-1;r++)l=T(this,s[i+r],e,r),l===R&&(l=this._$AH[r]),o||(o=!x(l)||l!==this._$AH[r]),l===N?t=N:t!==N&&(t+=(null!=l?l:"")+n[r+1]),this._$AH[r]=l}o&&!s&&this.k(t)}k(t){t===N?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class V extends L{constructor(){super(...arguments),this.type=3}k(t){this.element[this.name]=t===N?void 0:t}}class j extends L{constructor(){super(...arguments),this.type=4}k(t){t&&t!==N?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class z extends L{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=T(this,t,e,0))&&void 0!==i?i:N)===R)return;const s=this._$AH,n=t===N&&s!==N||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==N&&(s===N||n);n&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class D{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){T(this,t)}}const G=window.litHtmlPolyfillSupport;var Y,F;null==G||G(P,I),(null!==(p=globalThis.litHtmlVersions)&&void 0!==p?p:globalThis.litHtmlVersions=[]).push("2.0.1");class K extends c{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=((t,e,i)=>{var s,n;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let r=o._$litPart$;if(void 0===r){const t=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;o._$litPart$=r=new I(e.insertBefore(m(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!1)}render(){return R}}K.finalized=!0,K._$litElement$=!0,null===(Y=globalThis.litElementHydrateSupport)||void 0===Y||Y.call(globalThis,{LitElement:K});const J=globalThis.litElementPolyfillSupport;null==J||J({LitElement:K}),(null!==(F=globalThis.litElementVersions)&&void 0!==F?F:globalThis.litElementVersions=[]).push("3.0.1");const q=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function W(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):q(t,e)}const Z={pinyinjiajia:"拼音加加",ziranma:"自然码",microsoft:"微软双拼",zhongwenzhixing:"中文之星",xiaoe:"小鹅双拼",ziguang:"紫光双拼"};var X=function(t,e,i,s){var n,o=arguments.length,r=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(o<3?n(r):o>3?n(e,i,r):n(e,i))||r);return o>3&&r&&Object.defineProperty(e,i,r),r};let tt=class extends K{constructor(){super(),this.config={solution:"pinyinjiajia"},this.shortcuts=[{label:"中英文输入切换",value:"Alt + 空格键"},{label:"字符宽度为全角输入",value:"Shift + 空格键"},{label:"标点符号中英文模式切换",value:"Ctrl + ."}],this.solutions=Z,this.currentSolution="pinyinjiajia",this.baseInfo=[{id:"chos_prev_page_selection",type:"checkbox",value:!0,label:"用“-”键和“=”键在候选字词列表中翻页"},{id:"chos_next_page_selection",type:"checkbox",value:!0,label:"用“,”键和“.”键在候选字词列表中翻页"},{id:"chos_init_sbc_selection",type:"checkbox",value:!1,label:"初始字符宽度为全角"},{id:"chos_init_punc_selection",type:"checkbox",value:!0,label:"初始标点符号宽度为全角"},{id:"chos_init_vertical_selection",type:"checkbox",value:!1,label:"纵向显示候选词列表"}],chrome.storage.sync.get("config",(t=>{if(t&&t.config){let e=this.config=t.config;Reflect.has(e,"solution")&&(this.currentSolution=e.solution);for(let t of this.baseInfo)Reflect.has(e,t.id)&&(t.value=e[t.id])}}))}changeConfig(){chrome.storage.sync.set({config:this.config})}handleEvent(t){let e=t.target.id;e&&"shuangpin-solutions"===e?(this.config.solution=t.target.value,this.changeConfig()):e&&(this.config[e]=!this.config[e],this.changeConfig())}render(){return B`
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
                ${Object.keys(this.solutions).map((t=>B`
                    <option value="${t}" ?selected=${t===this.currentSolution}>${this.solutions[t]}</option>
                  `))}
              </select>
            </span>
          </div>
          ${this.baseInfo.map((t=>B`
              <div>
                <span class="controlled-setting-with-label">
                  <input @click=${this.handleEvent} .type=${t.type} ?checked=${t.value} .id=${t.id}>
                  <span>
                    <label .for=${t.id}>${t.label}</label>
                  </span>
                </span>
              </div>
            `))}
        </section>
      </div>
      <div>
        <section>
          <h3>快捷键</h3>
          ${this.shortcuts.map((t=>B`
              <div>
                <span class="controlled-setting-with-label">
                  <span class="selection-label">
                   <label>${t.label}</label>
                  </span>
                  <span style="background: #f2f2f2;padding: 4px 8px;border-radius: 4px;">
                    ${t.value}
                  </span>
                </span>
              <div>
            `))}
        </section>
      </div>
    `}};tt.styles=((t,...i)=>{const n=1===t.length?t[0]:i.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new s(n,e)})`
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
  
  `,X([W({type:String})],tt.prototype,"currentSolution",void 0),X([W({type:Array})],tt.prototype,"baseInfo",void 0),tt=X([t=>"function"==typeof t?((t,e)=>(window.customElements.define("option-page",e),e))(0,t):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(t){window.customElements.define("option-page",t)}}})(0,t)],tt)})();