"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isExactlyOne = exports.isOneOrMore = exports.isZeroOrOne = exports.first = exports.skip = exports.take = exports.fromPromise = exports.of = exports.from = exports.foldLeft = exports.filter = exports.forEach = exports.fromArgs = undefined;
exports.compose = compose;

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
exports.transform = transform;

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

require("rxjs/add/operator/toArray");

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

require("rxjs/add/operator/zip");

var _pipe = require("rxjs/util/pipe");

var fromArgs = exports.fromArgs = function fromArgs(args) {
	return seq(args.map(function (x) {
		return seq(x);
	})).concatAll();
};

function compose() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return fromArgs(args).toArray().map(function (a) {
		return _pipe.pipe.apply(a, a);
	});
}

var forEach = exports.forEach = function forEach($s, $fn) {
	if (!(0, _util.isUndef)($fn)) return seq($fn).concatMap(function (fn) {
		return seq($s).concatMap(function (x) {
			return seq(fn(x));
		});
	});
	return seq($s).map(function (fn) {
		return (0, _operators.concatMap)(function (x) {
			return seq(fn(x));
		});
	});
};
var filter = exports.filter = _operators.filter;
var _wrap = function _wrap(fn) {
	return function () {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		return seq(fn.apply(null, args.map(function (x) {
			return seq(x);
		})));
	};
};

var foldLeft = exports.foldLeft = function foldLeft() {
	var len = arguments.length;
	var $s = seq(arguments.length <= 0 ? undefined : arguments[0]);
	var $seed = len == 2 ? undefined : seq(arguments.length <= 1 ? undefined : arguments[1]);
	var $fn = exactlyOne(len == 2 ? arguments.length <= 1 ? undefined : arguments[1] : arguments.length <= 2 ? undefined : arguments[2]);
	return $fn.concatMap(function (fn) {
		return seq($s.reduce(_wrap(fn), $seed));
	}).concatAll();
};

var from = exports.from = function from(a) {
	return _Observable.Observable.from(a);
};

var of = exports.of = function of(a) {
	return _Observable.Observable.of(a);
};

var fromPromise = exports.fromPromise = function fromPromise(a) {
	return _Observable.Observable.fromPromise(a);
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
	for (var _len3 = arguments.length, a = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
		a[_key3] = arguments[_key3];
	}

	if (a.length == 0) return _Observable.Observable.empty();
	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) return x;
		if ((0, _util.isUndefOrNull)(x)) return _Observable.Observable.empty();
		if ((0, _util.isObject)(x) && (x instanceof Promise || typeof x.then == "function")) return fromPromise(x);
		if (Array.isArray(x) || x[Symbol.iterator] && typeof x != "string" && !(0, _util.isDOMNode)(x) && !(0, _util.isUntypedAtomic)(x) && !(0, _access.isVNode)(x) && !(0, _util.isList)(x) && !(0, _util.isMap)(x)) return from(x);
		return of(x);
	}
	return from(a).map(function (a) {
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

var isZeroOrOne = exports.isZeroOrOne = function isZeroOrOne(s) {
	return s.isEmpty().merge(s.skip(1).isEmpty()).reduce(function (a, x) {
		return a || x;
	});
};

var isOneOrMore = exports.isOneOrMore = function isOneOrMore(s) {
	return s.isEmpty().map(function (x) {
		return !x;
	});
};

var isExactlyOne = exports.isExactlyOne = function isExactlyOne(s) {
	return s.isEmpty().merge(s.skip(1).isEmpty().map(function (x) {
		return !x;
	})).reduce(function (a, x) {
		return a || x;
	}).map(function (x) {
		return !x;
	});
};

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	var s = seq($arg);
	return isZeroOrOne(s).switchMap(function (test) {
		return test ? s : (0, _error.error)("FORG0003");
	});
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	var s = seq($arg);
	return isOneOrMore(s).switchMap(function (test) {
		return test ? s : (0, _error.error)("FORG0004");
	});
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	var s = seq($arg);
	return isExactlyOne(s).switchMap(function (test) {
		return test ? s : (0, _error.error)("FORG0005");
	});
}

function transform($arg, $fn) {
	var s = seq($arg);
	return seq($fn).concatMap(function (fn) {
		return isExactlyOne(s).switchMap(function (test) {
			return test ? s.concatMap(function (x) {
				return x[Symbol.iterator] ? from(x).pipe(fn).reduce(function (a, x) {
					return a["@@transducer/step"](a, x);
				}, x["@@transducer/init"]()).map(function (x) {
					return x["@@transducer/result"](x);
				}) : s.pipe(fn);
			}) : s.pipe(fn);
		});
	});
}