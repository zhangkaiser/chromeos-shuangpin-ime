
interface SolutionDataType {
  bootKey: string
  initial: Record<string, string>
  vowel: Record<string, string| string[]>
}

const ziranma = {
  bootKey: 'o',
  initial: {
    i: 'ch',
    u: 'sh',
    v: 'zh'
  },
  vowel: {
    l: 'ai',
    j: 'an',
    h: 'ang',
    k: 'ao',
    z: 'ei',
    f: 'en',
    g: 'eng',
    r: ['er', 'uan'],
    w: ['ia', 'ua'],
    m: 'ian',
    d: ['iang', 'uang'],
    c: 'iao',
    x: 'ie',
    n: 'in',
    y: ['ing', 'uai'],
    s: ['iong', 'ong'],
    q: 'iu',
    b: 'ou',
    t: ['ue', 've'],
    v: 'ui',
    p: 'un',
    o: 'uo'
  }
}

const microsoft = {
  bootKey: 'o',
  initial: {
    i: 'ch',
    u: 'sh',
    v: 'zh'
  },
  vowel: {
    l: 'ai',
    j: 'an',
    h: 'ang',
    k: 'ao',
    z: 'ei',
    f: 'en',
    g: 'eng',
    r: ['er', 'uan'],
    w: ['ia', 'ua'],
    m: 'ian',
    d: ['iang', 'uang'],
    c: 'iao',
    x: 'ie',
    n: 'in',
    ';': 'ing',
    s: ['iong', 'ong'],
    q: 'iu',
    b: 'ou',
    y: ['uai', 'v'],
    t: 'ue',
    v: ['ui', 've'],
    p: 'un',
    o: 'uo'
  }
}

const ziguang = {
  bootKey: 'o',
  initial: {
    a: 'ch',
    i:  'sh',
    u: 'zh'
  },
  vowel: {
    q: 'ao',
    w: 'en',
    r: 'an',
    t: 'eng',
    y: ['in', 'uai'],
    o: 'uo',
    p: 'ai',
    s: 'ang',
    d: 'ie',
    f: 'ian',
    g: ['iang', 'uang'],
    h: ['iong', 'ong'],
    j: ['er', 'iu'],
    k: 'ei',
    l: 'uan',
    ';': 'ing',
    z: 'ou',
    x: ['ia', 'ua'],
    b: 'iao',
    n: ['ue', 've', 'ui'],
    m: 'un'
  }
}

const zhongwenzhixing = {
  bootKey: 'o',
  initial: {
    i: 'sh',
    u: 'ch',
    v: 'zh'
  },
  vowel: {
    q: ['er', 'ing'],
    w: 'ei',
    r: 'en',
    t: 'eng',
    y: ['iong', 'ong'],
    o: 'uo',
    p: 'ou',
    s: 'ai',
    d: 'ao',
    f: 'an',
    g: 'ang',
    h: ['iang', 'uang'],
    j: 'ian',
    k: 'iao',
    l: 'in',
    z: 'un',
    x: ['uai', 'ue', 've'],
    c: 'uan',
    v: 'ui',
    b: ['ia', 'ua'],
    n: 'iu',
    m: 'ie'
  }
}

const pinyinjiajia = {
  bootKey: 'o',
  initial: {
    i: 'sh',
    u: 'ch',
    v: 'zh'
  },
  vowel: {
    o: 'uo',
    v: 'ui',
    q: ['er', 'ing'],
    w: 'ei',
    r: 'en',
    t: 'eng',
    y: ['iong', 'ong'],
    p: 'ou',
    s: 'ai',
    d: 'ao',
    f: 'an',
    g: 'ang',
    h: ['iang', 'uang'],
    j: 'ian',
    k: 'iao',
    l: 'in',
    z: 'un',
    x: ['uai', 'ue'],
    c: 'uan',
    b: ['ia', 'ua'],
    n: 'iu',
    m: 'ie'
  }
}

const xiaoe = {
  bootKey: 'o',
  initial: {
    i: 'ch',
    u: 'sh',
    v: 'zh'
  },
  vowel: {
    d: 'ai',
    j: 'an',
    h: 'ang',
    c: 'ao',
    w: 'ei',
    f: 'en',
    g: 'eng',
    x: ['ia', 'ua'],
    m: 'ian',
    l: ['iang', 'uang'],
    n: 'iao',
    p: 'ie',
    b: 'in',
    k: ['ing', 'uai'],
    s: ['iong', 'ong'],
    q: ['iu'],
    z: 'ou',
    r: 'uan',
    t: 'ue',
    v: 'ui',
    y: 'un',
    o: 'uo'
  }
}


export const solutions:Record<string, SolutionDataType> = {
  pinyinjiajia,
  ziranma,
  microsoft,
  zhongwenzhixing,
  xiaoe,
  ziguang
}

export const solutionNames  = {
  pinyinjiajia: '拼音加加',
  ziranma: '自然码',
  microsoft: '微软双拼',
  zhongwenzhixing: '中文之星',
  xiaoe: '小鹤双拼',
  ziguang: '紫光双拼'
}