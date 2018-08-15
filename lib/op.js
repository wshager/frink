"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eq = eq;
exports.ne = ne;
exports.gt = gt;
exports.lt = lt;
exports.ge = ge;
exports.le = le;
exports.geq = geq;
exports.gne = gne;
exports.ggt = ggt;
exports.glt = glt;
exports.gge = gge;
exports.gle = gle;
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
exports.div = div;
exports.idiv = idiv;

var _type = require("./type");

function eq($a, $b) {
  return (0, _type.op)($a, "eq", $b);
}

function ne($a, $b) {
  return (0, _type.op)($a, "ne", $b);
}

function gt($a, $b) {
  return (0, _type.op)($a, "gt", $b);
}

function lt($a, $b) {
  return (0, _type.op)($a, "lt", $b);
}

function ge($a, $b) {
  return (0, _type.op)($a, "ge", $b);
}

function le($a, $b) {
  return (0, _type.op)($a, "le", $b);
}

function geq($a, $b) {
  return (0, _type.op)($a, "=", $b);
}

function gne($a, $b) {
  return (0, _type.op)($a, "!=", $b);
}

function ggt($a, $b) {
  return (0, _type.op)($a, ">", $b);
}

function glt($a, $b) {
  return (0, _type.op)($a, "<", $b);
}

function gge($a, $b) {
  return (0, _type.op)($a, ">=", $b);
}

function gle($a, $b) {
  return (0, _type.op)($a, "<=", $b);
}

function add($a, $b) {
  return (0, _type.op)($a, "+", $b);
}

function subtract($a, $b) {
  return (0, _type.op)($a, "-", $b);
}

function multiply($a, $b) {
  return (0, _type.op)($a, "*", $b);
}

function div($a, $b) {
  return (0, _type.op)($a, "/", $b);
}

function idiv($a, $b) {
  return (0, _type.op)($a, "idiv", $b);
}
//# sourceMappingURL=op.js.map