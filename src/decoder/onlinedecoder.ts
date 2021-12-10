import { OnlineEngine } from "./enums";
import { FetchReturnType, Fetch } from "../utils/fetch";
import { Candidate } from "./candidate";

/** 
 * The IME response online decoder.
 */
export class OnlineDecoder {

  /** The decoder request object. */
  private _request?: FetchReturnType | null;
  private _cache: Record<string, string> = {};

  constructor(
    /** The decoder engine. */ private engine: OnlineEngine = OnlineEngine.BAIDU
  ) {}

  #send(source: string) {
    if (this.engine == OnlineEngine.BAIDU) {
      return Fetch.get(`https://olime.baidu.com/py?py=${source}&rn=0&pn=1&ol=1`);
    } else {
      return Fetch.get(`https://olime.baidu.com/py?py=${source}&rn=0&pn=1&ol=1`);
    }
  }

  getCandidate(target: string) {
    return new Candidate(
      target.length,
      target,
      10000
    );
  }

  /** Online engine handler. */
  async #engineHandler(data: any) {
    if (this.engine == OnlineEngine.BAIDU) {

      data = await data.json();
      if (data[0] && data[0][0] && data[0][0][0]) {
        let target = data[0][0][0][0];
        let candidate = this.getCandidate(target);
        return candidate;
      } else {
        return null;
      }

    } else {
      return null;
    }
  }

  async decode(source: string) {
    console.log(this._cache);
    if (Reflect.has(this._cache, source)) {
      return await this.getCandidate(this._cache[source]);
    }
    // TODO(error!)
    // Abort the last request.
    if (this._request && !this._request.signal.aborted) {
      this.clear();
    }

    this._request = this.#send(source);

    return this._request.promise.then(this.#engineHandler.bind(this))
      .then(candidate => {
        this._cache[source] = candidate!.target;
        return candidate;
      });
  }

  clear() {
    this._request?.abort();
    this._request = null;
  }
}