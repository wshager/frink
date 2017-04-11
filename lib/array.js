"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isArray = isArray;
exports.array = array;
exports.join = join;
exports.head = head;
exports.tail = tail;
exports.size = size;
exports.subarray = subarray;
exports.insertBefore = insertBefore;
exports.remove = remove;
exports.append = append;
exports.reverse = reverse;
exports.flatten = flatten;
exports.get = get;

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _error = require("./error");

var _seq = require("./seq");

var _transducers = require("./transducers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var List = rrb.empty.constructor;

List.prototype.__is_List = true;

function isArray($maybe) {
	let maybe = (0, _seq.first)($maybe);
	return !!(maybe && maybe.__is_List);
}

function array(...a) {
	var l = a.length;
	if (l === 0) {
		return rrb.empty;
	}
	if (l == 1 && (0, _seq.isSeq)(a[0])) {
		return rrb.fromArray(a[0].toArray());
	}
	return rrb.fromArray(a); //into(a,compose(filter(_ => !isEmpty(_)), forEach(_ => first(_))), rrb.empty);
}

function join($a) {
	if ($a === undefined) return (0, _error.error)("XPTY0004");
	// assume a sequence of vectors
	return (0, _transducers.foldLeft)(a, function (pre, cur) {
		var v = (0, _seq.first)(cur);
		if (!isArray(v)) return (0, _error.error)("XPTY0004", "One of the items for array:join is not an array.");
		return pre.concat(v);
	}, rrb.empty);
}

function _checked($a, fn, ...args) {
	if ($a === undefined) return (0, _error.error)("XPTY0004");
	var a = $a;
	if ((0, _seq.isSeq)($a)) {
		if ($a.size > 1) return (0, _error.error)("XPTY0004");
		a = (0, _seq.first)($a);
	}
	if (!isArray(a)) return (0, _error.error)("XPTY0004");
	console.log(fn,a,args)
	return fn.apply(a, args);
}

function head($a) {
	return _checked($a, rrb.slice, 0, 1);
}

function tail($a) {
	return _checked($a, rrb.slice, 1);
}

function size($a) {
	return _checked($a, List.prototype.count);
}

function subarray($a, $s, $e) {
	var s = (0, _seq.first)($s) || 1,
	    e = (0, _seq.first)($e);
	return _checked($a, rrb.slice, s - 1, e);
}

function insertBefore($a, $i, $v) {
	var i = (0, _seq.first)($i) || 1;
	// unmarshal Singleton
	var v = (0, _seq.isSeq)($v) && $v.size > 1 ? $v : (0, _seq.first)($v);
	// slice from 0 to i
	// slice form i to end
	// concat s1 + v + s2
	return _checked($a, function (a) {
		return a.slice(0, i).push(v).concat(a.slice(i));
	});
}

function remove($a, $i) {
	var i = (0, _seq.first)($i) || 1;
	var ix = i.valueOf() - 1;
	return _checked($a, function (a) {
		return a.slice(0, ix).concat(a.slice(ix));
	});
}

function append($a, $v) {
	var v = (0, _seq.isSeq)($v) && $v.size > 1 ? $v : (0, _seq.first)($v);
	return _checked($a, rrb.push, v);
}

function reverse($a) {
	return _checked($a, function (a) {
		return rrb.fromArray(rrb.toArray(a).reverse());
	});
}

function flatten($a) {
	return (0, _transducers.into)($a, _transducers.cat, (0, _seq.seq)());
}

function get($a, $i) {
	var i = (0, _seq.first)($i) || 1;
	var ix = i.valueOf() - 1;
	return _checked($a, rrb.get, ix);
}
