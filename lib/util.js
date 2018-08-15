"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isPromise = isPromise;
exports.isNumber = isNumber;
exports.isDOMNode = isDOMNode;
exports.isUntypedAtomic = isUntypedAtomic;
exports.isList = isList;
exports.isMap = isMap;
exports.ucs2length = ucs2length;
exports.range = range;
exports.camelCase = camelCase;
exports.isNodeEnv = exports.DONE = exports.isUndefOrNull = exports.isNull = exports.isUndef = exports.isArray = exports.toString = exports.id = void 0;

// helpers
const id = a => a;

exports.id = id;
const toString = Object.prototype.toString;
exports.toString = toString;
const isArray = typeof Array.isArray === "function" ? Array.isArray : function (obj) {
  return toString.call(obj) == "[object Array]";
};
exports.isArray = isArray;

function isFunction(x) {
  return typeof x === "function";
}

function isObject(x) {
  return x instanceof Object && Object.getPrototypeOf(x) === Object.getPrototypeOf({});
}

function isPromise(x) {
  return !!x && x instanceof Promise;
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

const isUndef = s => s === undefined;

exports.isUndef = isUndef;

const isNull = s => s === null;

exports.isNull = isNull;

const isUndefOrNull = s => isUndef(s) || isNull(s);

exports.isUndefOrNull = isUndefOrNull;
const DONE = {
  done: true
};
exports.DONE = DONE;
const regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function ucs2length(string) {
  let counter = 0;
  string = string.replace(regexAstralSymbols, "_");
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

function range(n) {
  var arr = new Array(n);

  for (var i = 0; i < arr.length;) {
    arr[i] = ++i;
  }

  return arr;
}

const _isNode = () => {
  let isNode = false;

  try {
    isNode = Object.prototype.toString.call(global.process) === "[object process]";
  } catch (e) {
    isNode = false;
  }

  return isNode;
}; // Only Node.JS has a process variable that is of [[Class]] process


const isNodeEnv = _isNode();

exports.isNodeEnv = isNodeEnv;

function camelCase(str) {
  return str.split(/-/g).map((_, i) => i > 0 ? _.charAt(0).toUpperCase() + _.substr(1) : _).join("");
}
//# sourceMappingURL=util.js.map