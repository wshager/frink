"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.head = head;
exports.tail = tail;
exports.insertBefore = insertBefore;
exports.remove = remove;
exports.reverse = reverse;
exports.subsequence = subsequence;
exports.exists = exports.empty = void 0;

var _seq = require("../seq");

var _util = require("../util");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _impl = require("../impl");

var _error = _interopRequireDefault(require("../error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const empty = s => (0, _seq.isSeq)(s) ? (0, _operators.isEmpty)()(s) : (0, _util.isNull)(s);

exports.empty = empty;

const exists = s => (0, _seq.isSeq)(s) ? (0, _rxjs.pipe)((0, _operators.isEmpty)(), (0, _operators.map)(_impl.not))(s) : !(0, _util.isNull)(s);

exports.exists = exists;

function head($a) {
  return (0, _util.isNull)($a) || !(0, _seq.isSeq)($a) ? $a : (0, _operators.take)(1)($a);
}

function tail($a) {
  return (0, _util.isNull)($a) || !(0, _seq.isSeq)($a) ? null : (0, _operators.skip)(1)($a);
}

function insertBefore($s, pos, $ins) {
  return (0, _rxjs.pipe)((0, _operators.take)(pos - 1), (0, _operators.merge)((0, _seq.seq)($ins), (0, _operators.skip)(pos)))((0, _seq.seq)($s));
}

function remove($a, i) {
  if ((0, _util.isUndef)(i)) return (0, _error.default)("XPST0017");
  $a = (0, _seq.seq)($a);
  return (0, _operators.merge)((0, _operators.take)(i < 1 ? 0 : i - 1)($a), $a.skip(i));
}

function reverse($a) {
  return !(0, _seq.isSeq)($a) ? $a : (0, _rxjs.pipe)((0, _operators.toArray)(), (0, _operators.mergeMap)(a => a.reverse()))($a);
}

function subsequence($a, i, l = 0) {
  if ((0, _util.isUndef)(i)) return (0, _error.default)("XPST0017");
  $a = (0, _seq.seq)($a);
  i = i - 1;
  var d = i < 0 ? i : 0;
  return l === 0 ? (0, _operators.skip)(i)($a) : (0, _rxjs.pipe)((0, _operators.skip)(i), (0, _operators.take)(l - d))($a);
}
//# sourceMappingURL=op.js.map