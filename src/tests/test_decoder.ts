import {Decoder} from "../decoder/decoder";
import { InputTool } from "../decoder/enums";

let decoder = new Decoder(InputTool.PINYIN);

let ret = decoder.decode('zhongguo', 50);
console.log(ret);