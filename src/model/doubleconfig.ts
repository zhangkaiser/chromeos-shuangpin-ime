import { Config } from "./config";

/**
 * 类解析双拼解决方案.
 */
export default class ShuangpinConfig extends Config {
    /** 在弹出编辑器打开之前进行转换 */
    preTransform() {
        return "";
    }

    /** 当弹出编辑器打开进行转换 */
    transform(content: string, c: string, raw?:string) {
        
        return c;
    }

    postTransform(c: string): string {
        return ""
    }

    transformView(text: string, rawStr?: string): string {
        return ""
    }

    getTransform(c: string): string | string[] {
        return c;
    }

     
}