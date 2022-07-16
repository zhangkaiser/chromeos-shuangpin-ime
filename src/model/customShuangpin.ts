
/**
 * Support user customization of shuangpin model.
 */

export const enum KeyCode {
  a = 97, b, c, d, 
  e, f, g, h, 
  i, j, k, l, 
  m, n, o, p, 
  q, r, s, t, 
  u, v, w, x, 
  y, z
}

export type CharKeyType = keyof typeof KeyCode;


export function getSingleCharMap() {
  let alphabet = "abcdefghijklmnopqrstuvwxyz";
  let obj: Record<string, string> = {};
  for (let i = 0, l = 26; i < l; i++) {
    let char = alphabet[i]
    obj[char] = char
  }
  return obj as Record<CharKeyType, CharKeyType>
}

const { 
  a, b, c, d,
  e, f, g, h,
  i, j, k, l,
  m, n, o, p,
  q, r, s, t,
  u, v, w, x,
  y, z
} = getSingleCharMap();

type ShengMuType = Record<|
  "c" | "d" | "b" | "f" | "g" | "h" | "j" | "k" | "l" | "m" |
  "n" | "p" | "q" | "r" | "s" | "t" | "sh" | "zh" | "w" | "x" |
  "y" | "z" | "ch", CharKeyType>;


export const shengmuDefaultMap: ShengMuType = {
  c, d, b, f, g, h, j, k, l, m, n, p, q, r, s, t,
  "zh": "v", "sh": "i", "ch": "u", w, x, y, z
}


type YunMuType = Record<|
  "uang" | "iang" | "iong" | "ang" | "eng" | "ian" | "iao" | "ing" |
  "ong" | "uai" | "ai" | "ao" | "an"| "ei" | "en" | "er" | "ua" | "ie" | 
  "in" | "iu" | "ou" | "ia" | "ue" | "ui" | "un" | "uo" | 'uan' |
  "a" | "e" | "i" | "o" | "u" | "v", CharKeyType>;

export const yunmuDefaultMap: YunMuType = {
  a, e, i, o, u, v,
  "uang": "h", "iang": "h", "iong": "y", "ong": "y",
  "ang": "g", "er": "q", "ing": "q", "ei": "w", "en": "r",
  "uo": "o", "ai": "s", "ao": "d", "an": "f", "ian": "j",
  "iao": "k", "in": "l", "un": "z", "iu": "n", "ie": "m",
  "eng": "t", "uai": "x", "ue": "x", "ia": "b", "ua": "b",
  "ou": "p", "ui": "v", "uan": 'c'
}

type YinJieType = Record<|
  "a" | "ai" | "an" | "ang" | "ao" | "e" | "ei" | "en" | "eng" | "er" |
  "o" | "ou", string>;
export const yinjieDefaultMap: YinJieType = {
  "a": "oa", "ai": "os", "an": "of", "ang": "og",
  "ao": "od", "e": "oe", "en": "or", "eng": "ot", 
  "er": "oq", "o": "oo", "ou": "op", "ei": "ow"
}


export interface IShuangpinModel {
  shengmu: ShengMuType
  yunmu: YunMuType,
  yinjie: YinJieType
}

export class CustomShuangpin implements IShuangpinModel {
  constructor(
    public shengmu: ShengMuType, 
    public yunmu: YunMuType,
    public yinjie: YinJieType
  ) { }
}