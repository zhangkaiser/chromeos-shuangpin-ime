
/**
 * Support user customization of shuangpin model.
 */

type ShengMuType = |
  "c" | "d" | "b" | "f" | "g" | "h" | "j" | "k" | "l" | "m" |
  "n" | "p" | "q" | "r" | "s" | "t" | "sh" | "zh" | "w" | "x" |
  "y" | "z";

type YunMuType = |
  "uang" | "iang" | "iong" | "ang" | "eng" | "ian" | "iao" | "ing" |
  "ong" | "uai" | "ai" | "ao" | "ei" | "en" | "er" | "ua" | "ie" | 
  "in" | "iu" | "ou" | "ia" | "ue" | "ui" | "un" | "uo" |
  "a" | "e" | "i" | "o" | "u" | "v";

type YinJieType = |
  "a" | "ai" | "an" | "ang" | "ao" | "e" | "ei" | "en" | "eng" | "er" |
  "o" | "ou";

const enum KeyCode {
  a = 97, b, c, d, 
  e, f, g, h, 
  i, j, k, l, 
  m, n, o, p, 
  q, r, s, t, 
  u, v, w, x, 
  y, z
}



type CharKeyType = keyof typeof KeyCode;

export interface ICustomShuangpin {
  shengmu: Record<"A", CharKeyType>
  yunmu: Record<YunMuType, CharKeyType>,
  yinjie: Record<YinJieType, CharKeyType>
}

export class CustomShuangpin implements ICustomShuangpin {
    
}