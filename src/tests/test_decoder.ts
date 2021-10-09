import {Decoder} from "../decoder/decoder";
import { InputTool } from "../decoder/enums";

let decoder = new Decoder(InputTool.PINYIN);
let ret = decoder.decode('chuang', 50);
console.log(ret);

ret = decoder.decode('shuang', 50);
console.log(ret);