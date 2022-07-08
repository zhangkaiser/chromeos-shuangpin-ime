
export function isPinyin(str: string) {
  return /pinyin/.test(str);
}

export function isJS(str: string) {
  return /js/.test(str);
}