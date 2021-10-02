import type { Collection } from "./enums";
/**
 * Simple IndexedDB database package. 
 */
export class Database extends EventTarget {
  protected _idbRequest: IDBOpenDBRequest;
  protected _db?: IDBDatabase;
  private _opened?:boolean;

  public idbTransaction?: IDBTransaction;
  constructor() {
    super()
    this._idbRequest = indexedDB.open('decoder');
    
    this._idbRequest.onsuccess = () => {
      this._opened = true;
      this._db = this._idbRequest.result
      this._errorHandler(this._db, 'Error loading database!')
    }

    this._idbRequest.onupgradeneeded = () => {
      this._opened = true;
      this._db = this._idbRequest.result;
      this._errorHandler(this._db, 'Error loading database!')
      this.dispatchEvent(new CustomEvent('upgradeneeded'))
    }

    this._errorHandler(this._idbRequest, 'Error opening IndexedDB!');
  }

  async isOpen() {
    if (this._opened) {
      return await true
    }
    return await new Promise((resolve, reject) => {
      
      let it = setInterval(() => {
        if (this._opened) {
          resolve(true)
        }
      }, 300)

      setTimeout(() => {
        clearInterval(it)
        reject(false)
      }, 3000);
    })
  }

  async createCollection(colName: string, options:IDBObjectStoreParameters | undefined) {
    await this.isOpen()
    return this._db!.createObjectStore(colName, options);
  }

  async readCollection(colName: string) {
    await this.isOpen();
    let idbTransaction = this.idbTransaction = this._db?.transaction(colName, 'readonly');
    return idbTransaction?.objectStore(colName)
  }

  async collection(colName: string) {
    await this.isOpen();
    let idbTransaction = this.idbTransaction = this._db?.transaction(colName, 'readwrite');
    return idbTransaction?.objectStore(colName)
  }

  commit() {
    this.idbTransaction?.commit();
  }

  async get(colName: Collection, keyValue: IDBValidKey | IDBKeyRange, indexName?: string) {
    let collection = await this.collection(colName)
    
    if (indexName) { // IDBIndex support.
      let index = collection?.index(indexName);
      return await idbRequestResult(index!.get(keyValue))
    } else { // Keypath
      return await idbRequestResult(collection!.get(keyValue))
    }
  }

  async count(colName: Collection, query?: IDBValidKey | IDBKeyRange) {
    let collection = await this.collection(colName)
    return (await idbRequestResult(collection!.count(query))) as number
  }


  async getDB() {
    await this.isOpen();
    return this._db!;
  }
  
  _errorHandler(handler: IDBRequest | IDBOpenDBRequest | IDBDatabase, str: string) {
    handler.onerror = (err) => {
      console.error(str)
      throw new Error(err.type)
    }
  }

}

export function idbRequestResult(idbRequest: IDBRequest) {
  return new Promise((resolve, reject) => {
    idbRequest.onsuccess = () => {
      resolve(idbRequest.result)
    }

    idbRequest.onerror = reject
  })
}