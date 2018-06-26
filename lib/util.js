"use strict";

const _Subject = require("rxjs/Subject");

const _Observable = require("rxjs/Observable");

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isDOMNode = isDOMNode;
exports.isUntypedAtomic = isUntypedAtomic;
exports.isList = isList;
exports.isMap = isMap;
exports.ucs2length = ucs2length;
exports.range = range;
exports.camelCase = camelCase;
// helpers
Array.prototype.last = function() {
	return this[this.length - 1];
};

Array.prototype.concatMap = function(fn,cx) {
	const ret = [];
	for(let i=0;i<this.length;i++) {
		ret.push(...fn.call(cx,this[i],i,this));
	}
	return ret;
};

const isObservable = a => a && (a instanceof _Subject.Subject || a instanceof _Observable.Observable);

exports.isObservable = isObservable;

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
	return !isNodeEnv && x && x instanceof Node;
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

var _isNode = function _isNode() {
	var isNode = false;
	try {
		isNode = Object.prototype.toString.call(global.process) === "[object process]";
	} catch (e) {
		isNode = false;
	}
	return isNode;
};
// Only Node.JS has a process variable that is of [[Class]] process
var isNodeEnv = exports.isNodeEnv = _isNode();

function camelCase(str) {
	return str.split(/-/g).map(function (_, i) {
		return i > 0 ? _.charAt(0).toUpperCase() + _.substr(1) : _;
	}).join("");
}
