import { fetchLocalJson } from "./fetch";

let dict: Record<string, string> = {};
/** Transform Simplified Chinese to Traditional Chinese  */
export function hans2Hant(hans: string){
	if (dict) {
		let hant = hans.replace(/[^\x00-\xFF]/g, 
			(s: string) => ((s in dict) ? dict[s] : s));
		console.log(hant, hans, dict);
		return hant;
	} else {
		return hans;
	}
}


export function loadDict() {
	fetchLocalJson('hans2hant').then(res => dict = res);
}