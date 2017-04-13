"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LazySeq = LazySeq;
exports.seq = seq;
exports.isSeq = isSeq;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;
function LazySeq(iterable) {
	this.iterable = isSeq(iterable) ? iterable.toArray() : iterable || [];
}

LazySeq.prototype.push = function (v) {
	return this.concat(v);
};

// TODO create seq containing iterator, partially iterated
// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@append"] = LazySeq.prototype.push;

LazySeq.prototype.__is_Seq = true;

LazySeq.prototype.concat = function (...a) {
	var ret = _isArray(this.iterable) ? this.iterable : Array.from(this.iterable);
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
	return "[" + this.iterable + "]";
};

LazySeq.prototype.count = function () {
	return this.iterable.length;
};

LazySeq.prototype.toArray = function () {
	return this.iterable;
};

Object.defineProperty(LazySeq.prototype, "size", {
	get: function () {
		return this.count();
	}
});

function SeqIterator(iterable) {
	this.iter = iterable[Symbol.iterator]();
}

SeqIterator.prototype["@@append"] = LazySeq.prototype.push;

SeqIterator.prototype["@@empty"] = function () {
	return new LazySeq();
};

const DONE = {
	done: true
};

SeqIterator.prototype.next = function () {
	var v = this.iter.next();
	if (v.done) return DONE;
	return v;
};

SeqIterator.prototype[Symbol.iterator] = function () {
	return this;
};

LazySeq.prototype[Symbol.iterator] = function () {
	return new SeqIterator(this.iterable);
};

function _isArray(a) {
	return !!a && a.constructor == Array;
}

function seq(...a) {
	var s = new LazySeq();
	return s.concat.apply(s, a);
}

function isSeq(a) {
	return !!a && a.__is_Seq;
}

const Seq = exports.Seq = LazySeq;

const isEmpty = exports.isEmpty = s => isSeq(s) && !s.count();

const first = exports.first = s => isSeq(s) ? _isArray(s.iterable) ? s.iterable[0] : _first(s.iterable) : s;

const undef = s => s === undefined || s === null;

function empty(s) {
	return isSeq(s) ? !s.count() : undef(s);
}

function exists($i) {
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
	if ($arg.size > 1) return error("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	if ($arg === undefined) return error("FORG0004");
	if (!isSeq($arg)) return $arg;
	if ($arg.size === 0) return error("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	if ($arg === undefined) return error("FORG0005");
	if (!isSeq($arg)) return $arg;
	if ($arg.size != 1) return error("FORG0005");
	return $arg;
}