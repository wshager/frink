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

export const isUndef = s => s === undefined;

export const isNull = s => s === null;

export const isUndefOrNull = s => isUndef(s) || isNull(s);

export const DONE = {
	done: true
};
