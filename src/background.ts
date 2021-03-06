// import IMEBackground from "src/backgrounds/ime";
import DecoderBackground from "src/backgrounds/decoder";
import Background from "src/backgrounds/background";

// Don't support tree-shaking.
// For ESM need add 'sideEffects: false ' attribute to 'package.json' file.
if (process.env.MAIN) {
  new Background();
}

// if (process.env.IME) {
//   new IMEBackground();
// }

if (process.env.DECODER) {
  new DecoderBackground();
}
