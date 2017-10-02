"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.dedupe = exports.dropWhile = exports.takeWhile = exports.drop = exports.take = exports.keep = exports.erase = exports.filter = exports.cat = exports.MergeMapOperator = undefined;
exports.compose = compose;
exports.forEach = forEach;
exports.foldLeft = foldLeft;
exports.transform = transform;
exports.into = into;
exports.range = range;

var _mergeMap = require("rxjs/operator/mergeMap");

Object.defineProperty(exports, "MergeMapOperator", {
	enumerable: true,
	get: function () {
		return _mergeMap.MergeMapOperator;
	}
});

var _transducers = require("transducers.js");

Object.defineProperty(exports, "cat", {
	enumerable: true,
	get: function () {
		return _transducers.cat;
	}
});
Object.defineProperty(exports, "filter", {
	enumerable: true,
	get: function () {
		return _transducers.filter;
	}
});
Object.defineProperty(exports, "erase", {
	enumerable: true,
	get: function () {
		return _transducers.erase;
	}
});
Object.defineProperty(exports, "keep", {
	enumerable: true,
	get: function () {
		return _transducers.keep;
	}
});
Object.defineProperty(exports, "take", {
	enumerable: true,
	get: function () {
		return _transducers.take;
	}
});
Object.defineProperty(exports, "drop", {
	enumerable: true,
	get: function () {
		return _transducers.drop;
	}
});
Object.defineProperty(exports, "takeWhile", {
	enumerable: true,
	get: function () {
		return _transducers.takeWhile;
	}
});
Object.defineProperty(exports, "dropWhile", {
	enumerable: true,
	get: function () {
		return _transducers.dropWhile;
	}
});
Object.defineProperty(exports, "dedupe", {
	enumerable: true,
	get: function () {
		return _transducers.dedupe;
	}
});

var _seq = require("./seq");

var t = _interopRequireWildcard(_transducers);

var _RangeObservable = require("rxjs/observable/RangeObservable");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function compose() {
	var l = arguments.length;
	var funcs = new Array(l);
	for (var i = 0; i < l; ++i) {
		funcs[i] = arguments[i];
	}
	return function (r) {
		var value = r;
		for (var i = l - 1; i >= 0; i--) {
			value = funcs[i](value);
		}
		return value;
	};
}

function forEach(iterable, f) {
	if (arguments.length == 1) return t.map(iterable);
	return transform(iterable, t.map(f));
}
/*
export function distinctCat(iterable, f) {
	if (arguments.length < 2) return distinctCat$1(iterable || _contains);
	return _iterate(iterable, distinctCat$1(f), _new(iterable));
}
*/
// non-composable
function foldLeft(iterable, z, f) {
	return iterable.reduce(f, z);
}

// FIXME always return a collection, iterate by overriding _append to just return the value
function transform(iterable, f) {
	return _seq.isSeq(iterable) ? iterable.transform(f) : t.seq(iterable, f);
}

function into(iterable, f, z) {
	return t.into(z, f, iterable);
}

function range(n, s = 0) {
	return _seq.seq(new _RangeObservable.RangeObservable(s, n));
}