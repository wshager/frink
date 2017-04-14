"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.subsequence = subsequence;
exports.head = head;
exports.tail = tail;
exports.remove = remove;
exports.reverse = reverse;

var _seq = require("./seq");

var _transducers = require("./transducers");

function subsequence($a, $i, $l) {
	let i = _seq.first($i),
	    l = _seq.first($l);
	i = i.valueOf() - 1;
	var d = i < 0 ? i : 0;
	var f = l === undefined ? _transducers.drop(i) : _transducers.compose(_transducers.drop(i), _transducers.take(l.valueOf() - d));
	return _transducers.transform($a, f);
}

function head($a) {
	return _transducers.take($a, 1);
}

function tail($a) {
	return _transducers.drop($a, 1);
}

function remove($a, $i) {
	let i = _seq.first($i);
	i = i.valueOf() - 1;
	return _transducers.filter($a, (_, j) => j != i);
}

function reverse($a) {
	return _seq.seq($a.toArray().reverse());
}