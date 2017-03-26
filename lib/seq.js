"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LazySeq = LazySeq;
exports.toSeq = toSeq;
exports.seq = seq;
exports.isSeq = isSeq;
function LazySeq(iterable) {
	this.iterable = iterable || [];
}

LazySeq.prototype.push = function (v) {
	return this.concat(v);
};

// TODO create seq containing iterator, partially iterated
// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@append"] = LazySeq.prototype.push;

LazySeq.prototype.__is_Seq = true;

LazySeq.prototype.concat = function (...v) {
	return new LazySeq(this.iterable.concat(v));
};

LazySeq.prototype.toString = function () {
	return "[" + this.iterable + "]";
};

LazySeq.prototype.count = function () {
	return this.iterable.length;
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

function toSeq(a) {
	return new LazySeq(a);
}

function seq(...a) {
	return new LazySeq(a);
}

function isSeq(a) {
	return !!a && a.__is_Seq;
}

const Seq = exports.Seq = LazySeq;