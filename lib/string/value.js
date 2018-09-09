"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringJoin = stringJoin;
exports.concat = concat;
exports.substring = substring;
exports.stringLength = stringLength;
exports.normalizeSpace = normalizeSpace;
exports.normalizeUnicode = normalizeUnicode;
exports.upperCase = upperCase;
exports.lowerCase = lowerCase;
exports.translate = translate;

var _seq = require("../seq");

var _util = require("../util");

function stringJoin(a, sep = "") {
  return (0, _seq.foldLeft)("", (acc, x) => acc + sep + x)(a);
} // TODO: use fromArgs function to flatten array of possible observables (maybe's)


function concat(...args) {
  return args.join("");
}

function substring(str, s, l) {
  s = Math.round(s) - 1;
  return (0, _util.isUndef)(l) ? str.substr(s) : str.substr(s, Math.round(l));
}

function stringLength(str) {
  return (0, _util.ucs2length)(str);
}

function normalizeSpace(str) {
  return str.replace(/^[\x20\x9\xD\xA]+|[\x20\x9\xD\xA]+$/g, "").replace(/[\x20\x9\xD\xA]+/g, " ");
}

function normalizeUnicode(str, form) {
  return str.normalize(form.toUpperCase());
}

function upperCase(str) {
  return str.toUpperCase();
}

function lowerCase(str) {
  return str.toLowerCase();
}

function translate(str, mapStr, transStr) {
  const m = Array.from(mapStr),
        t = Array.from(transStr);
  return m.reduce((acc, c, idx) => acc.replace(c, t[idx] || ""), str);
}
//# sourceMappingURL=value.js.map