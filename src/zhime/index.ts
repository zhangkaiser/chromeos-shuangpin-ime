// 用来解决多端API差异

import { IIMEMethodUnion, IMEMethodInterface, imeMethodList } from "src/utils/chromeosIME";

class ApiControllerProxy {
  [name: string]: any;

  port?: chrome.runtime.Port;

  constructor(host: "chromeos" | "zhime") {
    if (host === "chromeos") {
      imeMethodList.forEach((methodName) => {
        this[methodName] = chrome.input.ime[methodName as IIMEMethodUnion];
      });
    }

    if (host === "zhime") {
      imeMethodList.forEach((methodName) => {
        if (Reflect.has(this, methodName)) return;
        this[methodName] = (...args: any[]) => {
          this.handleMethod(methodName as IIMEMethodUnion, args);
        }
      });
    }
  }

  keyEventHandled(requestId: string, response: boolean) {
    this.handleMethod("keyEventHandled", [[requestId, response]]);
  }

  private handleMethod(method: IIMEMethodUnion, args: any[]) {
    if (this.port) {
      this.port.postMessage({
        data: {
          type: method,
          value: args
        }
      })
    }
  }
}

export interface IApiController {
  new (host: string): IMEMethodInterface;
  prototype: IMEMethodInterface;
}

export const ApiController = ApiControllerProxy as any as IApiController;
