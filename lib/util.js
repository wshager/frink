"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.ucs2length = ucs2length;
// helpers
var toString = exports.toString = Object.prototype.toString;
var isArray = exports.isArray = typeof Array.isArray === "function" ? Array.isArray : function (obj) {
	return toString.call(obj) == "[object Array]";
};

function isFunction(x) {
	return typeof x === "function";
}

function isObject(x) {
	return x instanceof Object && Object.getPrototypeOf(x) === Object.getPrototypeOf({});
}

function isNumber(x) {
	return typeof x === "number";
}

var isUndef = exports.isUndef = function isUndef(s) {
	return s === undefined;
};

var isNull = exports.isNull = function isNull(s) {
	return s === null;
};

var isUndefOrNull = exports.isUndefOrNull = function isUndefOrNull(s) {
	return isUndef(s) || isNull(s);
};

var DONE = exports.DONE = {
	done: true
};

var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function ucs2length(string) {
	var counter = 0;
	string = string.replace(regexAstralSymbols, "_");
	var length = string.length;
	while (counter < length) {
		var value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			var extra = string.charCodeAt(counter);
			if ((extra & 0xFC00) == 0xDC00) counter++; // Low surrogate.
		}
	}
	return counter;
}