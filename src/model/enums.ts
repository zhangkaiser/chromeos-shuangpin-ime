
/**
 * The EventType for event in chrome os extension.
 * @enum {string}
 */
export enum EventType {
  KEYDOWN = 'keydown',
  KEYUP = 'keyup',
  COMMIT = 'commit',
  MODELUPDATED = 'update',
  CLOSING = 'close',
  OPENING = 'open',
  UPDATESTATE = 'updatestate',
}


/** The key value for chrome os extension. */
export enum Key {
  UP = 'Up',
  DOWN = 'Down',
  PAGE_UP = 'Page_up',
  PAGE_DOWN = 'Page_down',
  SPACE = ' ',
  ENTER = 'Enter',
  BACKSPACE = 'Backspace',
  ESC = 'Esc',
  LEFT = 'Left',
  RIGHT = 'Right',
  INVALID = '\ufffd'
}

/** The modifiers for chrome os extension. */
export enum Modifier {
  SHIFT = 'Shift',
  CTRL = 'Control',
  ALT = 'Alt'
}

/** The keyboard layouts for zhuyin. */
export enum KeyboardLayouts {
  STANDARD = 'Default',
  GINYIEH = 'Gin Yieh',
  ETEN = 'Eten',
  IBM = 'IBM',
  HSU = 'Hsu',
  ETEN26 = 'Eten 26'
};

/**  The input method model status. */
export enum Status {
  INIT = 0,
  FETCHING = 1,
  FETCHED = 2,
  SELECT = 3
}


/** The states ids(or key name for global state). */
export enum StateID {
  LANG = 'lang',
  SBC =  'sbc',
  PUNC = 'punc',
  TRADITIONAL = 'traditional',
  ONLINE_DECODER = 'online'
}


/** The key for the transform result. */
export enum TransID {
  BACK = 0,
  TEXT = 1,
  INSTANT = 2
}


/** The message keys. */
export enum MessageKey {
  SOURCE = 'source',
  HIGHLIGHT = 'highlight',
  APPEND = 'append',
  DELETE = 'delete',
  REVERT = 'revert',
  CLEAR = 'clear',
  IME = 'ime',
  SELECT_HIGHLIGHT = 'select_highlight',
  SELECT = 'select',
  COMMIT = 'commit',
  MULTI = 'multi',
  FUZZY_PAIRS = 'fuzzy_pairs',
  USER_DICT = 'user_dict',
  COMMIT_MARK = '|'
}

export enum InputToolCode {
  PINYIN_SIMPLIFIED = 'zh-t-i0-pinyin',
  PINYIN_TRADITIONAL = 'zh-hant-t-i0-pinyin',
  SHUANGPIN_SIMPLIFIED = 'zh-t-i0-shuangpin',
  SHUANGPIN_TRADITIONAL = 'zh-hant-t-i0-shuangpin'
}