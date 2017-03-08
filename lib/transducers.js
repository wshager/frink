'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isIterable = isIterable;
exports.filter$1 = filter$1;
exports.forEach$1 = forEach$1;
exports.foldLeft = foldLeft;
exports.filter = filter;
exports.forEach = forEach;
// very basic stuff, not really transducers but less code

function isIterable(obj) {
	return !!obj && typeof obj[Symbol.iterator] === 'function';
}

function _iterate(f, predicate) {
	return function* (iterable) {
		var i = 0;
		// iterate anything
		var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : {
			next: function () {
				return { value: iterable, done: true };
			}
		};
		let next;
		while (next = iter.next(), !next.done) {
			var v = next.value;
			if (predicate) {
				if (f(v, i, iterable)) yield v;
			} else {
				yield f(v, i, iterable);
			}
			i++;
		}
	};
}

function filter$1(f) {
	return _iterate(f, true);
}

function forEach$1(f) {
	return _iterate(f, false);
}

function foldLeft(f, acc) {
	return _iterate(f, false, acc);
}

function* filter(iterable, f) {
	yield* filter$1(f)(iterable);
}

function* forEach(iterable, f) {
	yield* forEach$1(f)(iterable);
}