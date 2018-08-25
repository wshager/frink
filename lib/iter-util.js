"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filter = exports.forEach = exports.foldLeft = void 0;

const foldLeft = (seed, fn) => a => {
  for (let x of a) {
    seed = fn(seed, x);
  }

  return seed;
};

exports.foldLeft = foldLeft;

const forEach = fn => function* (a) {
  for (let x of a) yield fn(x);
};

exports.forEach = forEach;

const filter = fn => function* (a) {
  for (let x of a) {
    if (fn(x)) yield x;
  }
};

exports.filter = filter;
//# sourceMappingURL=iter-util.js.map