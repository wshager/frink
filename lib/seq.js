"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LazySeq = LazySeq;

var _transducers = require("./transducers");

function LazySeq(iterable) {
	this.iterable = iterable;
}

LazySeq.prototype.filter = function (f) {
	return new LazySeq((0, _transducers.filter)(this.iterable, f));
};

LazySeq.prototype.map = function (f) {
	return new LazySeq((0, _transducers.forEach)(this.iterable, f));
};

LazySeq.prototype.get = function (index) {
	var i = 0;
	var iterable = this.iterable;
	var iter = (0, _transducers.isIterable)(iterable) ? iterable[Symbol.iterator]() : {
		next: function () {
			return { value: iterable, done: true };
		}
	};
	var next = iter.next();
	this.iterable = [];
	while (!next.done) {
		var v = next.value;
		this.iterable.push(v);
		if (i === index) {
			this.rest = iter;
			return v;
		}
		next = iter.next();
	}
};

LazySeq.prototype.toString = function () {
	return "[" + this.iterable + "]";
};