"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.first = exports.Seq = undefined;
exports.LazySeq = LazySeq;
exports.when = when;
exports.seq = seq;
exports.isSeq = isSeq;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;

var _Observable = require("rxjs/Observable");

var _transducers = require("./transducers");

var _error = require("./error");

require("rxjs/add/observable/from");

require("rxjs/add/operator/reduce");

require("rxjs/add/operator/map");

require("rxjs/add/operator/filter");

function LazySeq(iterable) {
	this.iterable = isSeq(iterable) ? iterable.iterable : iterable || [];
}

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

// TODO create seq containing iterator, partially iterated
// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@transducer/step"] = function (s, v) {
	return s.concat(v);
};

LazySeq.prototype["@@transducer/result"] = function (s) {
	return s;
};

LazySeq.prototype.__is_Seq = true;

LazySeq.prototype.concat = function () {
	// TODO lazy concat
	var ret = _isArray(this.iterable) ? this.iterable : Array.from(this.iterable);

	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	for (var i = 0, l = a.length; i < l; i++) {
		var x = a[i];
		if (_isArray(x)) {
			//  assume flat
			ret = ret.concat(x);
		} else if (isSeq(x)) {
			ret = ret.concat(x.toArray());
		} else {
			ret.push(x);
		}
	}
	return new LazySeq(ret);
};

LazySeq.prototype.toString = function () {
	return "Seq [" + this.iterable + "]";
};

LazySeq.prototype.toObservable = function () {
	var iterable = this.iterable;
	return (0, _transducers.isObservable)(iterable) ? iterable : _Observable.Observable.from(iterable);
};

LazySeq.prototype.asObservable = function () {
	return new LazySeq(this.toObservable());
};

LazySeq.prototype.toArray = function () {
	var iterable = this.iterable;
	if ((0, _transducers.isObservable)(iterable)) return iterable.reduce(function (a, x) {
		a.push(x);
		return a;
	}, []);
	return Array.from(iterable);
};

LazySeq.prototype.asArray = function () {
	return new LazySeq(this.toArray());
};

LazySeq.prototype.transform = function (xf) {
	return new LazySeq((0, _transducers.transform)(this.iterable, xf));
};

LazySeq.prototype.count = function () {
	var iter = this.iterable;
	return _isArray(iter) ? iter.length : Infinity;
};

// just resolve a seq of promises, like Promise.all
function when(s, rs, rj) {
	var a = _isArray(s.iterable) ? s.iterable : Array.from(s.iterable);
	//console.log(ret)
	return Promise.all(a).then(function (res) {
		var ret = seq();
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = res[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var x = _step.value;

				ret = ret.concat(x);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return rs(ret);
	}, rj);
}

Object.defineProperty(LazySeq.prototype, "size", {
	get: function get() {
		return this.count();
	}
});

function SeqIterator(iterable) {
	this.iter = _isIter(iterable) ? iterable : iterable[Symbol.iterator]();
}

var DONE = {
	done: true
};

SeqIterator.prototype.next = function () {
	var v = this.iter.next();
	if (v.done) return DONE;
	return v;
};

LazySeq.prototype[Symbol.iterator] = function () {
	return new SeqIterator(this.iterable);
};

// durty stuff
LazySeq.prototype.subscribe = function (o) {
	return new LazySeq(this.toObservable().subscribe(o));
};

LazySeq.prototype.reduce = function (f, z) {
	var o = this.toObservable();
	return new LazySeq(arguments.length == 1 ? o.reduce(f) : o.reduce(f, z));
};

LazySeq.prototype.map = function (f) {
	return new LazySeq(this.toObservable().map(f));
};

function _isArray(a) {
	return a && a.constructor == Array;
}

function _isIter(a) {
	return a && typeof a.next == "function";
}

function _isObservable(a) {
	return a && a instanceof _Observable.Observable;
}

function seq() {
	for (var _len2 = arguments.length, a = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		a[_key2] = arguments[_key2];
	}

	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) return x;
		if (_isArray(x) || _isIter(x) || _isObservable(x)) return new LazySeq(x);
	}
	var s = new LazySeq();
	if (a.length === 0) return s;
	return s.concat.apply(s, a);
}

function isSeq(a) {
	return !!(a && a.__is_Seq);
}

var Seq = exports.Seq = LazySeq;

function _first(iter) {
	var next = iter.next();
	if (!next.done) return next.value;
}

var first = exports.first = function first(s) {
	if (!isSeq(s)) return s;
	var i = s.iterable;
	return _isArray(i) ? i[0] : _isIter(i) ? _first(i) : i;
};

var undef = function undef(s) {
	return s === undefined || s === null;
};

function empty(s) {
	return isSeq(s) ? !s.count() : undef(s);
}

function exists(s) {
	return isSeq(s) ? !!s.count() : !undef(s);
}

function count(s) {
	return empty(s) ? 0 : isSeq(s) ? s.count() : undef(s) ? 0 : 1;
}

function insertBefore(s, pos, ins) {
	pos = first(pos);
	pos = pos === 0 ? 1 : pos - 1;
	var a = s.toArray();
	var n = a.slice(0, pos);
	if (isSeq(ins)) {
		n = n.concat(ins.toArray());
	} else {
		n.push(ins);
	}
	return seq(n.concat(a.slice(pos)));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	if ($arg === undefined) return seq();
	if (!isSeq($arg)) return $arg;
	if ($arg.size > 1) return (0, _error.error)("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	if ($arg === undefined) return (0, _error.error)("FORG0004");
	if (!isSeq($arg)) return $arg;
	if ($arg.size === 0) return (0, _error.error)("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	if ($arg === undefined) return (0, _error.error)("FORG0005");
	if (!isSeq($arg)) return $arg;
	if ($arg.size != 1) return (0, _error.error)("FORG0005");
	return $arg;
}