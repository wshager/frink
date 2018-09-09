"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringToCodepoints = stringToCodepoints;
exports.codepointsToString = codepointsToString;

var _seq = require("../seq");

var _value = require("./value");

// TODO: use HOF from iterop: observables or transducers over iterables
function stringToCodepoints(str) {
  return (0, _seq.forEach)((0, _seq.from)(str), c => c.codePointAt(0));
}

function codepointsToString(a) {
  return (0, _value.stringJoin)((0, _seq.forEach)(a, _ => String.fromCodePoint(_ + "")));
}
//# sourceMappingURL=codepoint.js.map