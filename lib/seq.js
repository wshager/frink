"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forEach = forEach;
exports.filter = filter;
exports.foldLeft = foldLeft;
exports.scan = scan;
exports.seq = seq;
exports.just = just;
exports.create = create;
exports.range = range;
exports.sort = sort;
Object.defineProperty(exports, "pipe", {
  enumerable: true,
  get: function () {
    return _rxjs.pipe;
  }
});
exports.switchMap = exports.switchMapCurried = exports.count = exports.first = exports.scanCurried = exports.foldLeftCurried = exports.filterCurried = exports.forEachCurried = exports.isSeq = exports.fromArgs = exports.isSingle = exports.isMaybe = exports.Single = exports.Maybe = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _util = require("./util");

var _value = require("./boolean/value");

class Maybe extends _rxjs.Observable {
  toObservable() {
    return create($o => {
      this.subscribe($o);
    });
  }

}

exports.Maybe = Maybe;

class Single extends _rxjs.Observable {
  toObservable() {
    return create($o => {
      this.subscribe($o);
    });
  }

}

exports.Single = Single;

const isMaybe = x => !!(x && x instanceof Maybe);

exports.isMaybe = isMaybe;

const isSingle = x => !!(x && x instanceof Single);

exports.isSingle = isSingle;

_rxjs.Observable.prototype.toSingle = function () {
  return new Single($o => {
    (0, _operators.first)()(this).subscribe($o);
  });
};

_rxjs.Observable.prototype.toMaybe = function () {
  return new Maybe($o => {
    (0, _operators.first)()(this).subscribe($o);
  });
}; // TODO check each arg for Observable


const fromArgs = args => seq(args.map(x => seq(x))).pipe((0, _operators.concatAll)());

exports.fromArgs = fromArgs;
const isSeq = _rxjs.isObservable;
exports.isSeq = isSeq;

const wrap = fn => x => {
  const ret = fn(x);
  return isSeq(ret) || (0, _util.isPromise)(ret) ? ret : (0, _operators.subscribeOn)(_rxjs.Scheduler.queue)((0, _rxjs.of)(ret).toSingle());
};

const forEachCurried = fn => $s => isSeq($s) ? (0, _operators.mergeMap)(wrap(fn))($s) : fn($s);

exports.forEachCurried = forEachCurried;

function forEach($s, fn) {
  return !(0, _util.isUndef)(fn) ? forEachCurried(fn)($s) : forEachCurried($s);
}
/**
 * curried filter
 * @param  {function} fn [description]
 * @return {function}     [description]
 */


const filterCurried = fn => $s => isSeq($s) ? (0, _rxjs.pipe)((0, _operators.mergeMap)(x => (0, _operators.pairwise)()(seq((0, _value.boolean)(fn(x)), x))), (0, _operators.filter)(([t]) => t), (0, _operators.map)(([, x]) => x))($s) : (0, _rxjs.pipe)((0, _operators.filter)(t => t), (0, _operators.map)(() => $s))(seq(fn($s)));

exports.filterCurried = filterCurried;

function filter($s, fn) {
  return !(0, _util.isUndef)(fn) ? filterCurried(fn)($s) : filterCurried($s);
}

const foldLeftCurried = fn => $seed => $a => isSeq($a) ? (0, _rxjs.pipe)((0, _operators.reduce)((a, x) => fn(a, x), $seed), switchMap(_util.id))($a) : fn($seed, $a);

exports.foldLeftCurried = foldLeftCurried;

function foldLeft($a, $seed, fn) {
  return !(0, _util.isUndef)(fn) ? foldLeftCurried(fn)($seed)($a) : foldLeftCurried($seed)($a);
}

const scanCurried = fn => $seed => $a => isSeq($a) ? (0, _rxjs.pipe)(scan((a, x) => fn(a, x), $seed), switchMap(x => x))($a) : fn($seed, $a);

exports.scanCurried = scanCurried;

function scan($a, $seed, fn) {
  return !(0, _util.isUndef)(fn) ? scanCurried(fn)($seed)($a) : scanCurried($seed)($a);
}

function fromType(x) {
  return isSeq(x) ? x : (0, _util.isUndefOrNull)(x) ? (0, _rxjs.empty)() : (0, _rxjs.of)(x).toSingle();
}

function seq(...a) {
  const len = a.length;
  if (len == 0) return fromType();
  if (len == 1) return fromType(a[0]);
  return (0, _operators.concatMap)(x => seq(x))((0, _rxjs.from)(a));
}

function just(a) {
  return (isSeq(a) ? a : (0, _rxjs.of)(a)).toSingle();
}

function create(o) {
  return _rxjs.Observable.create(o);
} // TODO how to use f when not a seq?


const first = (f, d) => s => isSeq(s) ? (0, _operators.first)(f, d)(s) : (0, _util.isNull)(s) ? d : s;

exports.first = first;

const count = s => isSeq(s) ? (0, _operators.count)()(s) : 1;

exports.count = count;

function range(n, s = 0) {
  return (0, _operators.subscribeOn)(_rxjs.Scheduler.queue)((0, _rxjs.range)(s, n));
}

const switchMapCurried = fn => $s => isSeq($s) ? (0, _rxjs.pipe)((0, _operators.switchMap)(wrap(fn)), (0, _operators.subscribeOn)(_rxjs.Scheduler.queue), unsubscribeOn(_rxjs.Scheduler.queue))($s) : fn($s);

exports.switchMapCurried = switchMapCurried;

function unsubscribeOn(scheduler) {
  return source => create(observer => {
    const subscription = source.subscribe(observer);
    return () => scheduler.schedule(() => subscription.unsubscribe());
  });
}

const switchMap = ($s, fn) => !(0, _util.isUndef)(fn) ? switchMapCurried(fn)($s) : switchMapCurried($s); // FIXME


exports.switchMap = switchMap;

function sort($s, fn) {
  return switchMap(seq($s).toArray(), a => seq((0, _util.isUndef)(fn) ? a.sort() : a.sort(fn)));
}
//# sourceMappingURL=seq.js.map