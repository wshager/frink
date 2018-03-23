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

var _error = require("./error");

var _util = require("./util");

function subsequence($a, $i) {
	var $l = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	$a = (0, _seq.seq)($a);
	if ((0, _util.isUndef)($i)) return (0, _error.error)("XPST0017");
	return (0, _seq.seq)($i).concatMap(function (i) {
		return (0, _seq.seq)($l).concatMap(function (l) {
			i = i - 1;
			var d = i < 0 ? i : 0;
			return l === 0 ? $a.skip(i) : $a.pipe((0, _seq.skip)(i), (0, _seq.take)(l - d));
		});
	});
}

function head($a) {
	return (0, _seq.seq)($a).take(1);
}

function tail($a) {
	return (0, _seq.seq)($a).skip(1);
}

function remove($a, $i) {
	if ((0, _util.isUndef)($i)) return (0, _error.error)("XPST0017");
	return (0, _seq.seq)($i).concatMap(function (i) {
		return $a.take(i < 1 ? 0 : i - 1).merge($a.skip(i));
	});
}

function reverse($a) {
	return (0, _seq.seq)($a).reduce(function () {
		var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
		var x = arguments[1];

		arr.push(x);
		return arr;
	}, undefined).concatMap(function (x) {
		return x.reverse();
	});
}
