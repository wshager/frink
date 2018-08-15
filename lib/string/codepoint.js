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
  return (0, _seq.forEach)(c => c.codePointAt(0))(str);
}

function codepointsToString(a) {
  return (0, _value.stringJoin)((0, _seq.forEach)(_ => String.fromCodePoint(_.toString())(a)));
}
//# sourceMappingURL=codepoint.js.map