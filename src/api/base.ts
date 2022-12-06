
type EventNameType = string;
interface IEventManager {
  dispose(): void;
}
type EventManagerType = IEventManager | null;

export interface Disposable {
  dispose: Function;
}

export class EventListener {
  
  static getEventListener(manager: Record<string, any>,  eventName: string) {
    if (eventName in manager) {
      return manager[eventName].bind(manager);
    }
    throw new Error(`Not found ${eventName} function.`);
  }

  /** @deprecated May be not useful. */
  static getPoint(namespaces: string) {
    let currentPoint = globalThis;
    namespaces.split(".").forEach((name) => {
      if (name in currentPoint) {
        currentPoint = (currentPoint as any)[name];
      } else {
        throw new Error("Namespace error!");
      }
    });
    return currentPoint as any;
  }

  
  /** @todo */
  static registerListener<T extends Object>(namespace: T, eventName: string, manager: any) {

    // let point = typeof namespace == "string" ? EventListener.getPoint("chrome." + namespace) : namespace;
    if (IMEConfig.envName === "chromeos" 
      && Reflect.has(namespace, eventName) 
      && Reflect.has(manager, eventName)
    ) {

      let endPoint = (namespace as any)[eventName];
      if (Reflect.has(endPoint, 'addListener')) {

        let listener = manager[eventName].bind(manager);

        endPoint.addListener(listener);
        let dispose = () => {
          endPoint.removeListener(listener);
        }

        return { dispose }
      }
    }

    throw new Error(`${eventName} listener registration fatal.`);
  }

  static getListener<T>(manager: T, eventName: keyof T) {

    if (Reflect.has(manager as Object, eventName) && typeof (manager as any)[eventName] === 'function') {
      return (manager[eventName] as Function).bind(manager);
    }

    throw new Error("Registe");
  }

}

export class BaseEventManager extends EventTarget {

  _events: Record<string, EventManagerType> = {};

  set events(lists: [string, EventManagerType][]) {
    this._events = Object.fromEntries(lists);
  }

  addListeners<T extends Object>(namespace: T, eventsList: string[], manager: BaseEventManager) {
    this.events = eventsList.map((eventName) => {
      let eventManager = EventListener.registerListener(namespace, eventName, manager);
      return [eventName, eventManager];
    });
  }

  static dispose(disposable: Disposable) {
    disposable.dispose();
  }
  
}