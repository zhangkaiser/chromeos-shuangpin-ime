import { FetchReturnType, Fetch } from "../utils/fetch";
import { Candidate } from "./candidate";
import { IMEType } from "../utils/double-solutions";
import { OnlineEngine } from "src/model/enums";

/** 
 * The IME response online candidate.
 */
export default class OnlineCandidate {

  /** The decoder request object. */
  private _lastRequest?: FetchReturnType | null;
  
  /** The current process cache. */
  private _cache: Record<string, string> = {};

  /** The input type for google online decoder. */
  private _ime: string = 'pinyin';

  /** The setTimeout id. */
  private _timeout?: any;

  constructor(
    /** The decoder engine. */ private engine: OnlineEngine = OnlineEngine.BAIDU,
    /** The shuangpin solution. */ solution: string = 'pinyinjiajia'
  ) {
    this.setSolution(solution);
  }

  #getRequestUrl(engine: OnlineEngine, source: string, raw: string) {
    switch(engine) {
      case OnlineEngine.BAIDU: 
        return `https://olime.baidu.com/py?py=${source}&rn=0&pn=1&ol=1`;
      case OnlineEngine.GOOGLE:
      case OnlineEngine.GOOGLE_CN:
        let text = this._ime == 'pinyin' ? source : raw;
        let domain = 'google.com';
        if (engine == OnlineEngine.GOOGLE_CN) {
          domain = 'google.cn';
        }
        return `https://www.google.${engine == OnlineEngine.GOOGLE_CN ? 'cn' : 'com'}/inputtools/request?ime=${this._ime}&text=${text}`;    
    }
  }

  #send(url: string) {
    // return Fetch.get(url);
    return new Promise((resolve, reject) => {
      this._timeout = setTimeout(() => {
        this._timeout = undefined;
        this._lastRequest = Fetch.get(url);
        this._lastRequest.promise.then(resolve, reject);
      }, 500);
    })
  }

  /** Set the decoder engine. */
  setEngine(engine: OnlineEngine) {
    this.engine = engine;
  }

  /** Set the shuangpin solution.  */
  setSolution(solution: string) {
    this._ime =  Reflect.has(IMEType, solution) ? IMEType[solution] : 'pinyin'
  }

  getCandidate(target: string) {
    return new Candidate(
      target.length,
      target,
      10000,
      -1
    );
  }

  /** Online engine handler. */
  async #engineHandler(data: any) {
    data = await data.json();
    
    if (this.engine == OnlineEngine.BAIDU) {
      if (data[0] && data[0][0] && data[0][0][0]) {
        let target = data[0][0][0][0];
        let candidate = this.getCandidate(target);
        return candidate;
      }
    } else if (this.engine == OnlineEngine.GOOGLE_CN || this.engine == OnlineEngine.GOOGLE) {
      if (data[0] == 'SUCCESS') {
        if (data[1] && data[1][0] && data[1][0][1]) {
          let target = data[1][0][1][0];
          let candidate = this.getCandidate(target);
          return candidate;
        }
      }
    }
    return null;
  }

  /** @todo */
  async decode(source: string, raw: string) {
    if (raw.length < 3) {
      return null;
    }
    
    if (this._timeout || (this._lastRequest && !this._lastRequest.signal.aborted)) {
      this.clear();
    }

    if (Reflect.has(this._cache, source)) {
      return await this.getCandidate(this._cache[source]);
    }

    let requestUrl = this.#getRequestUrl(this.engine, source, raw);
    return this.#send(requestUrl)
      .then(this.#engineHandler.bind(this))
      .then(candidate => {
        if (this._lastRequest && this._lastRequest.signal.aborted) {
          return Promise.reject('The request was aborted.');
        };
        this._cache[source] = candidate!.target;
        return candidate;
      }).catch(console.error);

    // return this._lastRequest.promise.then(this.#engineHandler.bind(this))
    //   .then(candidate => {
    //     this._cache[source] = candidate!.target;
    //     return candidate;
    //   });
  }

  clear() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = undefined;
    this._lastRequest?.abort();
    this._lastRequest = null;
  }
}