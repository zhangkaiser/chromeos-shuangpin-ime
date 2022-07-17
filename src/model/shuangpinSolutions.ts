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

function pinyinjiajia(): IShuangpinModel {
  return {
    ...pinyinjiajia_o(),
    yinjie: {
      ...yinjieDefaultMap,
      a: 'aa', ai: 'as', an: 'af', ang: 'ag',
      ao: 'ad', e: 'ee', ei: 'ew', en: 'er',
      eng: 'et', er: 'eq', ou: 'op' 
    }
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

function ziranma(): IShuangpinModel {
  return {
    ...ziranma_o(),
    yinjie: {
      ...yinjieDefaultMap,
      a: 'aa', ai: 'ai', an: 'an', ang: 'ah', ao: 'ao',
      e: 'ee', ei: 'ei', en: 'en', eng: 'eg', er: 'er',
      o: 'oo', ou: 'ou'
    }
  }
}

/** @todo */
function zhongwenzhixing_o(): IShuangpinModel {
  return {
    shengmu: {
      ...shengmuDefaultMap,
      ch: 'u', sh: 'i', zh: 'v'
    },
    yunmu: {
      ...yunmuDefaultMap,
      er: 'q', ing: 'q', ei: 'w', en: 'r', eng: 't',
      iong: 'y', ong: 'y', uo: 'o', ou: 'p', ai: 's',
      ao: 'd', an: 'f', ang: 'g', iang: 'h', uang: 'h',
      ian: 'j', iao: 'k', in: 'l', un: 'z', uai: 'x', ue: 'x',
      uan: 'c', ui: 'v', ia: 'b', ua: 'b', iu: 'n', ie: 'm' 
    },
    yinjie: {
      ...yinjieDefaultMap,
      ai: 'os', an: 'of', ang: 'og', ao: 'od',
      ei: 'ow', en: 'or', eng: 'ot', er: 'oq',
      ou: 'op'
    }
  }
}

/** @todo */
export function xiaohe_o(): IShuangpinModel {
  return {
    shengmu: {
      ...shengmuDefaultMap,
      ch: 'i', sh: 'u', zh: 'v'
    },
    yunmu: {
      ...yunmuDefaultMap,
      ai: 'd', an: 'j', ang: 'h', ao: 'c', ei: 'w',
      en: 'f', eng: 'g', ia: 'x', ua: 'x', ian: 'm',
      iang: 'l', uang: 'l', iao: 'n', ie: 'p', in: 'b',
      ing: 'k', uai: 'k', iong: 's', ong: 's', iu: 'q',
      ou: 'z', uan: 'r', ue: 't', ui: 'v', un: 'y',
      uo: 'o'
    },
    yinjie: {
      ...yinjieDefaultMap,
      ai: 'od', an: 'oj', ang: 'oh', ao: 'oc',
      ei: 'ow', en: 'of', eng: 'og', er: 'er',
      ou: 'oz'
    }
  }
}

export function xiaohe(): IShuangpinModel {
  return {
    ...xiaohe_o(),
    yinjie: {
      ...yinjieDefaultMap,
      ai: 'ai', an: 'an', ang: 'ah', ao: 'ao',
      ei: 'ei', en: 'en', eng: 'eg', er: 'er',
      ou: 'ou', a: 'aa', e: 'ee', o: 'oo'
    }
  }
}

let solutions: Record<string, Function> = {
  pinyinjiajia_o,
  pinyinjiajia,
  ziranma_o,
  ziranma,
  zhongwenzhixing_o,
  xiaohe_o,
  xiaohe

}

export function getShuangpinSolution(name: string) {
  let func = solutions[name]; 
  return func ? func() : pinyinjiajia_o();
}