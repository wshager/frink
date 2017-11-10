// helpers
export const toString = Object.prototype.toString;
export const isArray = typeof Array.isArray === "function" ? Array.isArray : function(obj) {
	return toString.call(obj) == "[object Array]";
};

export function isFunction(x) {
	return typeof x === "function";
}

export function isObject(x) {
	return x instanceof Object &&
		Object.getPrototypeOf(x) === Object.getPrototypeOf({});
}

export function isNumber(x) {
	return typeof x === "number";
}

export function isUntypedAtomic(x) {
	return x instanceof Object && x.constructor.name == "UntypedAtomic";
}


export function isList(maybe) {
	return maybe && maybe.__is_List;
}


export function isMap(maybe) {
	return maybe && maybe.__is_Map;
}

export const isUndef = s => s === undefined;

export const isNull = s => s === null;

export const isUndefOrNull = s => isUndef(s) || isNull(s);

export const DONE = {
	done: true
};

const regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

export function ucs2length(string) {
	let counter = 0;
	string = string.replace(regexAstralSymbols,"_");
	const length = string.length;
	while (counter < length) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			const extra = string.charCodeAt(counter);
			if ((extra & 0xFC00) == 0xDC00) counter++; // Low surrogate.
		}
	}
	return counter;
}
