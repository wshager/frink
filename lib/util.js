"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNumber = isNumber;
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