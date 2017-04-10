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
	let i = (0, _seq.first)($i),
	    l = (0, _seq.first)($l);
	i = i.valueOf() - 1;
	var d = i < 0 ? i : 0;
	var f = l === undefined ? (0, _transducers.drop)(i) : (0, _transducers.compose)((0, _transducers.drop)(i), (0, _transducers.take)(l.valueOf() - d));
	return (0, _transducers.transform)($a, f);
}

function head($a) {
	return (0, _transducers.take)($a, 1);
}

function tail($a) {
	return (0, _transducers.drop)($a, 1);
}

function remove($a, $i) {
	let i = (0, _seq.first)($i);
	i = i.valueOf() - 1;
	return (0, _transducers.filter)($a, (_, j) => j != i);
}

function reverse($a) {
	return (0, _seq.seq)($a.toArray().reverse());
}