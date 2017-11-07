"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.first = exports.skip = exports.take = exports.compose = exports.of = exports.from = exports.foldLeft = exports.filter = exports.forEach = undefined;

var _pipe = require("rxjs/util/pipe");

Object.defineProperty(exports, "compose", {
	enumerable: true,
	get: function get() {
		return _pipe.pipe;
	}
});

var _operators = require("rxjs/operators");

Object.defineProperty(exports, "take", {
	enumerable: true,
	get: function get() {
		return _operators.take;
	}
});
Object.defineProperty(exports, "skip", {
	enumerable: true,
	get: function get() {
		return _operators.skip;
	}
});
exports.when = when;
exports.isSeq = isSeq;
exports.seq = seq;
exports.create = create;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.range = range;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;

var _Observable = require("rxjs/Observable");

var _error = require("./error");

var _util = require("./util");

var _access = require("./access");

require("rxjs/add/observable/of");

require("rxjs/add/observable/from");

require("rxjs/add/observable/fromPromise");

require("rxjs/add/observable/range");

require("rxjs/add/observable/empty");

require("rxjs/add/observable/throw");

require("rxjs/add/operator/isEmpty");

require("rxjs/add/operator/take");

require("rxjs/add/operator/skip");

require("rxjs/add/operator/first");

require("rxjs/add/operator/reduce");

require("rxjs/add/operator/map");

require("rxjs/add/operator/filter");

require("rxjs/add/operator/buffer");

require("rxjs/add/operator/merge");

require("rxjs/add/operator/mergeMap");

require("rxjs/add/operator/concat");

require("rxjs/add/operator/concatMap");

require("rxjs/add/operator/concatAll");

require("rxjs/add/operator/switch");

require("rxjs/add/operator/switchMap");

var forEach = exports.forEach = _operators.concatMap;
var filter = exports.filter = _operators.filter;
var _wrap = function _wrap(fn) {
	return function (acc, v) {
		return seq(fn(acc, v));
	};
};
var foldLeft = exports.foldLeft = function foldLeft() {
	var len = arguments.length;
	var $s = seq(arguments.length <= 0 ? undefined : arguments[0]).map(function (s) {
		return seq(s);
	});
	var $fn = exactlyOne(len == 2 ? arguments.length <= 1 ? undefined : arguments[1] : arguments.length <= 2 ? undefined : arguments[2]);
	var $seed = len == 2 ? seq() : seq($seed);
	var _reducer = function _reducer($seed) {
		return $fn.concatMap(function (fn) {
			return seq($s.reduce(_wrap(fn), $seed));
		}).concatAll();
	};
	return len == 2 ? _reducer(undefined) : _reducer($seed);
};

var from = exports.from = function from(a) {
	return _Observable.Observable.from(a);
};

var of = exports.of = function of(a) {
	return _Observable.Observable.of(a);
};

/*function _asyncIteratorToObservable(asyncIter) {
	const forEach = (ai, fn, cb) => {
		return ai.next().then(function (r) {
			if (!r.done) {
				try {
					fn(r.value);
				} catch(err) {
					cb(err);
				}
				return forEach(ai, fn, cb);
			} else {
				cb();
			}
		}, cb);
	};
	return new Observable(sink => {
		forEach(asyncIter,x => sink.next(x), err => {
			if(err) return sink.error(err);
			sink.complete();
		});
	});
}*/
/*
LazySeq.prototype.toString = function(){
	return "Seq [" + this.iterable + "]";
};
*/
// resolve an observable like a promise
function when(s, rs, rj) {
	return s.buffer().subscribe({
		next: function next(buf) {
			rs(buf);
		},
		error: function error(err) {
			rj(err);
		}
	});
}

function isSeq(a) {
	return !!(a && a instanceof _Observable.Observable);
}

function seq() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	if (a.length == 0) return _Observable.Observable.empty();
	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) return x;
		if ((0, _util.isUndefOrNull)(x)) return _Observable.Observable.empty();
		if ((0, _util.isObject)(x) && (x instanceof Promise || typeof x.then == "function")) return _Observable.Observable.fromPromise(x);
		if (Array.isArray(x) || x[Symbol.iterator] && typeof x != "string" && !(0, _util.isUntypedAtomic)(x) && !(0, _access.isVNode)(x)) return _Observable.Observable.from(x);
		return _Observable.Observable.of(x);
	}
	return _Observable.Observable.from(a).map(function (a) {
		return seq(a);
	}).concatAll();
}

function create(o) {
	return _Observable.Observable.create(o);
}

var first = exports.first = function first(s) {
	return seq(s).first();
};

function empty(s) {
	return seq(s).isEmpty();
}

function exists(s) {
	return !empty(s);
}

function count(s) {
	return seq(s).count();
}

function insertBefore(s, pos, ins) {
	s = seq(s);
	pos = pos - 1;
	return s.take(pos).merge(seq(ins), s.skip(pos));
}

function range($n) {
	var $s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	$n = zeroOrOne($n);
	$s = zeroOrOne($s);
	return $s.concatMap(function (s) {
		return $n.concatMap(function (n) {
			return _Observable.Observable.range(s, n);
		});
	});
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	var s = seq($arg);
	return s.isEmpty().merge(s.skip(1).isEmpty()).reduce(function (a, x) {
		return a || x;
	}).switchMap(function (isEmptyOrOne) {
		return isEmptyOrOne ? s : (0, _error.error)("FORG0003");
	});
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	var s = seq($arg);
	return s.isEmpty().switchMap(function (isEmpty) {
		return isEmpty ? (0, _error.error)("FORG0004") : s;
	});
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	var s = seq($arg);
	return s.isEmpty().merge(s.skip(1).isEmpty().map(function (x) {
		return !x;
	})).reduce(function (a, x) {
		return a || x;
	}).switchMap(function (isEmptyOrMore) {
		return isEmptyOrMore ? (0, _error.error)("FORG0005") : s;
	});
}