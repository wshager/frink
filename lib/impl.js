"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nodeData = nodeData;
exports.instanceOf = instanceOf;
exports.minus = minus;
exports.round = round;
exports.floor = floor;
exports.not = exports.or = exports.and = void 0;

const and = (a, b) => a && b;

exports.and = and;

const or = (a, b) => a || b;

exports.or = or;

const not = a => !a;

exports.not = not;

function nodeData(node) {
  const type = node.type; // type 2 will only appear in traversal when node is an attr

  if (type == 2 || type == 3) {
    return node.value;
  }
} // TODO card = zero-or-more(), but will always return a boolean
// cardinality is taken into account, so the generalized function needs to do that too


function instanceOf(a, b) {
  return a instanceof b;
} // TODO card = zero-or-one(), which will return empty() when zero
// better stick to some generally accepted form of Maybe(a) for these cases?
// more TODO generalize mapping of function names to number methods (perhaps with well-known aliases)


function minus(a) {
  return typeof a.neg == "function" ? a.neg() : -a;
}
/**
 * Round a number
 * @param  {[type]} $a [description]
 * @return {[type]}    [description]
 */


function round(number, precision) {
  // NOTE 'precision' is actually called 'scale'... bad W3C, bad!
  // TODO get the length of the string representation and use either toPrecision (or toExponential is precision is negative)
  return typeof number.round == "function" ? number.round() : Number.parseFloat(number.toFixed(precision));
}

function floor(a) {
  return typeof a.floor == "function" ? a.floor() : Math.floor(a);
}
//# sourceMappingURL=impl.js.map