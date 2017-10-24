"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.first = undefined;
exports.when = when;
exports.isSeq = isSeq;
exports.seq = seq;
exports.create = create;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;

var _Observable = require("rxjs/Observable");

var _error = require("./error");

require("rxjs/add/observable/of");

require("rxjs/add/observable/from");

require("rxjs/add/operator/isEmpty");

require("rxjs/add/operator/take");

require("rxjs/add/operator/skip");

require("rxjs/add/operator/findIndex");

require("rxjs/add/operator/first");

require("rxjs/add/operator/reduce");

require("rxjs/add/operator/map");

require("rxjs/add/operator/filter");

require("rxjs/add/operator/buffer");

require("rxjs/add/operator/merge");

require("rxjs/add/operator/mergeMap");

require("rxjs/add/operator/concat");

require("rxjs/add/operator/concatMap");

require("rxjs/add/operator/switchMap");

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
// just resolve a seq of promises, like Promise.all
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

var undef = function undef(s) {
	return s === undefined || s === null;
};

function seq() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	if (a.length == 0) return _Observable.Observable.empty();
	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) return x;
		if (undef(x)) return _Observable.Observable.empty();
		if (Array.isArray(x) || x[Symbol.iterator] && typeof x != "string" || typeof x.next == "function") return _Observable.Observable.from(x);
		return _Observable.Observable.of(x);
	}
	return _Observable.Observable.from(a);
}

function create(o) {
	return _Observable.Observable.create(o);
}

var first = exports.first = function first(s) {
	if (!isSeq(s)) s = seq(s);
	return s.first();
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
	return s.take(pos).merge(seq(ins), s.drop(pos));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	var s = seq($arg);
	return s.isEmpty().merge(s.skip(1).take(1).isEmpty()).reduce(function (a, x) {
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
	return s.isEmpty().merge(s.skip(1).take(1).isEmpty()).reduce(function (a, x) {
		return a || x;
	}).switchMap(function (isEmptyOrOne) {
		return isEmptyOrOne ? (0, _error.error)("FORG0005") : s;
	});
}