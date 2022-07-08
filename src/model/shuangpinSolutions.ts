import type { IShuangpinModel, CharKeyType } from "./customShuangpin";
import { KeyCode, CustomShuangpin, yinjieDefaultMap, shengmuDefaultMap, yunmuDefaultMap } from "./customShuangpin";


export function pinyinjiajia(): IShuangpinModel {
  // 'o' key boot.
  return {
    shengmu: shengmuDefaultMap,
    yunmu: yunmuDefaultMap,
    yinjie: yinjieDefaultMap
  }
}

