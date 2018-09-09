"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.max = exports.min = exports.avg = exports.sum = exports.count = void 0;

var _seq = require("../seq");

var _op = require("../op");

var _operators = require("rxjs/operators");

const count = s => (0, _seq.isSeq)(s) ? (0, _operators.count)()(s) : 1;

exports.count = count;

const sum = s => (0, _seq.foldLeftCurried)(_op.add)(0)(s);

exports.sum = sum;

const avg = s => (0, _seq.switchMap)(sum(s), a => (0, _seq.switchMap)(count(s), b => (0, _op.divide)(a, b)));

exports.avg = avg;

const min = s => (0, _operators.reduce)((a, x) => (0, _op.lt)(x, a) ? x : a)(s);

exports.min = min;

const max = s => (0, _operators.reduce)((a, x) => (0, _op.gt)(x, a) ? x : a)(s);

exports.max = max;
//# sourceMappingURL=aggregate.js.map