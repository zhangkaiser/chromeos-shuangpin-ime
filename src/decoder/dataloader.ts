import {Database} from "./database";
import { sourceMap, chosTokens, defaultProb, initialTokens } from "./staticdata";
import { Collection, InputTool } from "./enums";
/**
 * DataLoader provides the functions to load token
 * dictionary, generation model and dictionary for the offline transliterator.
 */
export class DataLoader {

  db: Database;
  sourceMap: {[str:string]: number[]};
  tokens: string;
  defaultProb: number;
  initialTokens: string;
  constructor(private inputTool: InputTool) {
    console.log(this.inputTool);
    this.db = new Database();
    // console.log('db', this.db)
    this.db.addEventListener('upgradeneeded', this.#createCollection.bind(this))
    this.sourceMap = sourceMap;
    this.tokens = chosTokens;
    this.defaultProb =  defaultProb;
    this.initialTokens = initialTokens;
  }

  /**
   * Handle the data.
   */
  async #createCollection() {


    let db = await this.db.getDB();
    
    /** targetMap */
    let targetMapCol = db.createObjectStore(Collection.TARGET_MAP);
    targetMapCol.createIndex('value', 'value')
    

    /** targetPositions */
    let targetPositionsCol = db.createObjectStore(Collection.TARGET_POSITIONS, {
      keyPath: 'index',
      autoIncrement: true
    })
    targetPositionsCol.createIndex('source', 'source', {
      unique: true
    })
    targetPositionsCol.createIndex('position', 'position', {
      unique: true
    })

    /** targetSegments */
    let targetSegmentsCol = db.createObjectStore(Collection.TARGET_SEGMENTS, {
      keyPath: 'index',
      autoIncrement: true
    })
    targetSegmentsCol.createIndex('segment', 'segment')
    targetSegmentsCol.createIndex('prob', 'prob')
    chrome.tabs.create({
      url: 'popup.html'
    })
  }

  async insertData() {
    let targetMapJsonURL = chrome.runtime.getURL('data/targetMap.json');
    let targetPositionsJsonURL = chrome.runtime.getURL('data/targetPositions.json');
    let targetSegmentsJsonURL = chrome.runtime.getURL('data/targetSegments.json');

    let targetMapJson = await fetch(targetMapJsonURL).then(res => res.json())
    // console.log(targetMapJsonURL)
    let targetMapCol = await this.db.collection(Collection.TARGET_MAP)
    if (!targetMapCol) {
      return ;
    }
    for (let item in targetMapJson) {
      targetMapCol?.add(targetMapJson[item], item)
    }
    this.db.commit();

    targetMapJson = [];

    let targetPositionsJson = await fetch(targetPositionsJsonURL).then(res => res.json())
    
    let targetPositionsCol = await this.db.collection(Collection.TARGET_POSITIONS);
    if (!targetPositionsCol) {
      return ;
    }
    targetPositionsJson.forEach((item: (number | number[])[]) => {
      targetPositionsCol?.add({
        source: item[0],
        position: item[1]
      })
    })

    this.db.commit();

    targetPositionsJson = [];

    let targetSegmentsJson = await fetch(targetSegmentsJsonURL).then(res => res.json())
    let targetSegmentsCol = await this.db.collection(Collection.TARGET_SEGMENTS);
    
    if (!targetSegmentsCol) {
      return ;
    }
    targetSegmentsJson.forEach((item: (number | number[])[]) => {
      targetSegmentsCol?.add({
        segment: item[0],
        prob: item[1]
      })
    })

    this.db.commit();
    targetSegmentsJson = [];
  }

  /**
   * The targetMap model data.
   */
  async targetMap(bytes: string) {
    return await this.db.get(Collection.TARGET_MAP, bytes)
  }

  /**
   * The targetMap model data count.
   */
  async targetMapCount() {
    return await this.db.count(Collection.TARGET_MAP)
  }

  /**
   * The targetPositions model data.
   */

   async targetPositions(index: number) {
    return (await this.db.get(Collection.TARGET_POSITIONS, index)) as TargetPosition
  }

  async targetPositionsSource(source: number | number[]) {
    return (await this.db.get(Collection.TARGET_POSITIONS, source, 'source')) as TargetPosition
  }

  async targetPositionsCount() {
    return await this.db.count(Collection.TARGET_POSITIONS)
  }

  /** 
   * The targetSegments model data.
   */
  async targetSegments(index: number) {
    return await this.db.get(Collection.TARGET_SEGMENTS, index) as TargetSegment;
  }

  /**
   * The targetSegements model data list.
   */
  async targetSegementsCursor(range: IDBKeyRange | IDBValidKey) {
    return await this.db.openCursor(Collection.TARGET_SEGMENTS, range) as TargetSegment[];
  }

  async targetSegmentsCount() {
    return await this.db.count(Collection.TARGET_SEGMENTS)
  }
}