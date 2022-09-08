import { hans2Hant, loadDict } from "src/utils/transform";

export class Translator {

  static states = {
    traditional: false,
  }

  static transform(text: string) {
    if (Translator.states.traditional) {
      return hans2Hant(text);
    }
    return text;
  }

  static enableTraditional(enable: boolean) {
    enable && loadDict();
    Translator.states.traditional = enable;
  }

  static enableEnglish(enable: boolean) {

  }
}