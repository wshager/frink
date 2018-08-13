import { foldLeft as reduce, fromArgs } from "../seq";

import { isUndef, ucs2length } from "../util";

export function stringJoin(a, sep = "") {
	return reduce(a,(acc, x) => acc + sep + x);
}

// TODO: use fromArgs function to flatten array of possible observables (maybe's)
export function concat(...args) {
	return stringJoin(fromArgs(args));
}

export function substring(str,s,l) {
	s = Math.round(s) - 1;
	return isUndef(l) ? str.substr(s) : str.substr(s,Math.round(l));
}

export function stringLength(str) {
	return ucs2length(str);
}

export function normalizeSpace(str) {
	return str.replace(/^[\x20\x9\xD\xA]+|[\x20\x9\xD\xA]+$/g,"").replace(/[\x20\x9\xD\xA]+/g," ");
}

export function normalizeUnicode(str,form) {
	return str.normalize(form.toUpperCase());
}

export function upperCase(str) {
	return str.toUpperCase();
}

export function lowerCase(str) {
	return str.toLowerCase();
}

export function translate(str, mapStr, transStr) {
	const m = Array.from(mapStr), t = Array.from(transStr);
	return m.reduce((acc,c,idx) => acc.replace(c,t[idx] || ""),str);
}
