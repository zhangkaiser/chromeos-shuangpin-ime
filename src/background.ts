import { Background as IMEBackground } from "src/backgrounds/ime";
import { Background as DecoderBackground } from "src/backgrounds/decoder";
import { Background } from "src/backgrounds/background";

if (process.env.IME) {
  new IMEBackground();
}

if (process.env.DECODER) {
  new DecoderBackground();
}

if (process.env.MAIN) {
  new Background();
}