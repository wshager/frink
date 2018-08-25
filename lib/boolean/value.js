"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boolean = boolean;
exports.not = not;

var _seq = require("../seq");

var _card = require("../seq/card");

var _operators = require("rxjs/operators");

var _util = require("../util");

var _l3n = require("l3n");

var _error = require("../error");

var impl = _interopRequireWildcard(require("../impl"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function boolean($a) {
  // type test
  return (0, _util.isUndef)($a) ? Boolean : !(0, _seq.isSeq)($a) ? (0, _util.isNull)($a) ? false : !!$a.valueOf() : (0, _seq.switchMap)((0, _card.isZeroOrOne)($a), t => t ? (0, _seq.switchMap)($a, a => (0, _l3n.isVNode)(a) ? true : !!a.valueOf()) : (0, _seq.switchMap)((0, _operators.skip)(1)($a), a => (0, _l3n.isVNode)(a) ? true : (0, _error.error)("err:FORG0006", "Second item is not a node")));
}

function not($a) {
  return (0, _seq.switchMap)(boolean($a), impl.not);
}
//# sourceMappingURL=value.js.map