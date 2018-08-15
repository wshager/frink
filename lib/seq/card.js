"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;
exports.isExactlyOne = exports.isOneOrMore = exports.isZeroOrOne = void 0;

var _seq = require("../seq");

var _error = require("../error");

var _impl = require("../impl");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _util = require("../util");

const isZeroOrOne = s => (0, _seq.isMaybe)(s) || !(0, _seq.isSeq)(s) || (0, _rxjs.pipe)((0, _operators.skip)(1), (0, _operators.isEmpty)())(s);

exports.isZeroOrOne = isZeroOrOne;

const isOneOrMore = s => !(0, _seq.isSeq)(s) && !(0, _util.isNull)(s) || (0, _rxjs.pipe)((0, _operators.isEmpty)(), (0, _operators.map)(_impl.not))(s);

exports.isOneOrMore = isOneOrMore;

const isExactlyOne = s => (0, _seq.isSingle)(s) || !(0, _seq.isSeq)(s) && !(0, _util.isNull)(s) || (0, _rxjs.pipe)((0, _operators.isEmpty)(), (0, _operators.zip)((0, _rxjs.pipe)((0, _operators.skip)(1), (0, _operators.isEmpty)())(s), (x, y) => !x && y))(s);

exports.isExactlyOne = isExactlyOne;

function _testCard($arg, card, err) {
  return (0, _seq.switchMap)(t => t ? $arg : (0, _error.error)(err))(card($arg));
}
/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error} [Process Error in implementation]
 */


function zeroOrOne($arg) {
  return _testCard($arg, isZeroOrOne, "FORG0003");
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */


function oneOrMore($arg) {
  return _testCard($arg, isOneOrMore, "FORG0004");
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */


function exactlyOne($arg) {
  return _testCard($arg, isExactlyOne, "FORG0005");
}
//# sourceMappingURL=card.js.map