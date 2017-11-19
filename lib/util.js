"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.foldLeft = exports.slice = exports.forEach = exports.pipe = exports.DONE = exports.isUndefOrNull = exports.isNull = exports.isUndef = exports.isArray = exports.toString = undefined;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isDOMNode = isDOMNode;
exports.isUntypedAtomic = isUntypedAtomic;
exports.isList = isList;
exports.isMap = isMap;
exports.ucs2length = ucs2length;
exports.range = range;

var _picoLambda = require("pico-lambda");

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

function isDOMNode(x) {
	return x && x instanceof Node;
}

function isUntypedAtomic(x) {
	return x instanceof Object && x.constructor.name == "UntypedAtomic";
}

function isList(maybe) {
	return maybe && maybe.__is_List;
}

function isMap(maybe) {
	return maybe && maybe.__is_Map;
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

function range(n) {
	var arr = new Array(n);
	for (var i = 0; i < arr.length;) {
		arr[i] = ++i;
	}
	return arr;
}

var pipe = exports.pipe = _picoLambda.pcore.pipe;
var forEach = exports.forEach = _picoLambda.parray.map;
var slice = exports.slice = _picoLambda.parray.slice;
var foldLeft = exports.foldLeft = _picoLambda.parray.reduce;