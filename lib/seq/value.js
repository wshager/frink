"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.indexOf = indexOf;

var _seq = require("../seq");

var _util = require("../util");

var _operators = require("rxjs/operators");

var _op = require("../op");

function indexOf($a, b) {
  if ((0, _util.isNull)($a)) return $a;
  if (!(0, _seq.isSeq)($a)) return (0, _op.eq)($a, b) ? 1 : null;
  return (0, _operators.pipe)((0, _operators.map)((a, idx) => [a, idx]), (0, _operators.filter)(a => (0, _op.eq)(a, b)), (0, _operators.map)(([, idx]) => idx + 1))($a);
}
//# sourceMappingURL=value.js.map