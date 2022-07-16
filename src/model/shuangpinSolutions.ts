import type { IShuangpinModel, CharKeyType } from "./customShuangpin";
import { KeyCode, CustomShuangpin, yinjieDefaultMap, shengmuDefaultMap, yunmuDefaultMap } from "./customShuangpin";

function pinyinjiajia_o(): IShuangpinModel {
  // 'o' key boot.
  return {
    shengmu: shengmuDefaultMap,
    yunmu: yunmuDefaultMap,
    yinjie: yinjieDefaultMap
  }
}

function ziranma_o(): IShuangpinModel {
  return {
    shengmu: {
      ...shengmuDefaultMap,
      ch: 'i', sh: 'u', zh: 'v'
    },
    yunmu: {
      ...yunmuDefaultMap,
      ai: 'l', an: 'j', ang: 'h', ao: 'k',
      ei: 'z', en: 'f', eng: 'g', er: 'r',
      uan: 'r', ia: 'w', ua: 'w', ian: 'm',
      iang: 'd', uang: 'd', iao: 'c', ie: 'x',
      in: 'n', ing: 'y', uai: 'y', iong: 's',
      ong: 's', iu: 'q', ou: 'b', ue: 't',
      ui: 'v', un: 'p', uo: 'o'
    },
    yinjie: {
     ...yinjieDefaultMap,
      ai: 'ol', an: 'oj', ang: 'oh', ao: 'ok',
      ei: 'oz', en: 'of', eng: 'og', er: 'or',
      ou: 'ob'
    }
  }
}

/** @todo */
function zhongwenzhixing_o() {

}

/** @todo */
export function xiaohe_o() {

}

let solutions: Record<string, Function> = {
  pinyinjiajia_o,
  ziranma_o,
  zhongwenzhixing_o,
  xiaohe_o
}

export function getShuangpinSolution(name: string) {
  let func = solutions[name]; 
  return func ? func() : pinyinjiajia_o();
}