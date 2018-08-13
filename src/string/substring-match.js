//import { defaultCollation } from "./env";

export function contains(a, b /*, collation = defaultCollation()*/){
	return a.includes(b);
}

export function startsWith(a,b) {
	return a.startsWith(b);
}

export function endsWith(a,b) {
	return a.endsWith(b);
}

export function substringBefore(a,b) {
	const idx = a.indexOf(b);
	return idx > -1 ? a.substr(0, idx) : "";
}

export function substringAfter(a,b) {
	const idx = a.indexOf(b) + 1;
	return idx ? a.substr(idx) : "";
}
