"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isArray = isArray;
exports.default = array;
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
exports.forEach = forEach;
exports.filter = filter;
exports.foldLeft = foldLeft;

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _error = require("./error");

var _seq = require("./seq");

var _transducers = require("./transducers");

var t = _interopRequireWildcard(_transducers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var List = rrb.empty.constructor;

List.prototype.__is_List = true;

List.prototype._type = 5;

List.prototype["@@transducer/init"] = function () {
	return rrb.empty;
};

List.prototype["@@transducer/step"] = function (l, x) {
	return l.push(x);
};

List.prototype["@@transducer/result"] = function (l) {
	return l;
};

rrb.TreeIterator.prototype["@@transducer/init"] = function () {
	return rrb.empty;
};

rrb.TreeIterator.prototype["@@transducer/step"] = function (l, x) {
	return l.push(x);
};

rrb.TreeIterator.prototype["@@transducer/result"] = function (l) {
	return l;
};

function isArray($maybe) {
	var maybe = (0, _seq.first)($maybe);
	return !!(maybe && maybe.__is_List);
}

function array() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	var l = a.length;
	if (l === 0) {
		return rrb.empty;
	}
	if (l == 1 && (0, _seq.isSeq)(a[0])) {
		return rrb.fromArray(a[0].toArray());
	}
	return rrb.fromArray(a);
}

function join($a) {
	if ($a === undefined) return (0, _error.error)("XPTY0004");
	// assume a sequence of vectors
	return t.foldLeft($a, rrb.empty, function (pre, cur) {
		var v = (0, _seq.first)(cur);
		if (!isArray(v)) return (0, _error.error)("XPTY0004", "One of the items for array:join is not an array.");
		return pre.concat(v);
	});
}

function _checked($a, fn) {
	if ($a === undefined) return (0, _error.error)("XPTY0004");
	var a = $a;
	if ((0, _seq.isSeq)($a)) {
		if ($a.size > 1) return (0, _error.error)("XPTY0004");
		a = (0, _seq.first)($a);
	}
	if (!isArray(a)) return (0, _error.error)("XPTY0004");

	for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
		args[_key2 - 2] = arguments[_key2];
	}

	args.unshift(a);
	return fn.apply(a, args);
}

function head($a) {
	return _checked($a, rrb.get, 0);
}

function tail($a) {
	return _checked($a, rrb.slice, 1);
}

function size($a) {
	return _checked($a, List.prototype.count);
}

function subarray($a, $s, $l) {
	var s = (0, _seq.first)($s) || 1,
	    l = (0, _seq.first)($l);
	var sx = s.valueOf() - 1;
	if (l) l = Math.max(sx + Number(l), 0);
	return _checked($a, rrb.slice, sx, l);
}

function insertBefore($a, $i, $v) {
	var i = (0, _seq.first)($i) || 1;
	var ix = i.valueOf() - 1;
	// unmarshal Singleton
	var v = (0, _seq.isSeq)($v) && $v.size != 1 ? $v : (0, _seq.first)($v);
	return _checked($a, function (a) {
		// slice from 0 to i
		// slice form i to end
		// concat s1 + v + s2
		return a.slice(0, ix).push(v).concat(a.slice(ix));
	});
}

function remove($a, $i) {
	var i = (0, _seq.first)($i) || 1;
	var ix = i.valueOf() - 1;
	return _checked($a, function (a) {
		return a.slice(0, ix).concat(a.slice(i));
	});
}

function append($a, $v) {
	var v = (0, _seq.isSeq)($v) && $v.size != 1 ? $v : (0, _seq.first)($v);
	return _checked($a, rrb.push, v);
}

function reverse($a) {
	return _checked($a, function (a) {
		return rrb.fromArray(a.toJS(true).reverse());
	});
}

function flatten($a) {
	return t.into($a, t.compose(t.cat, t.filter(function (_) {
		return _ !== undefined;
	})), (0, _seq.seq)());
}

function get($a, $i) {
	var i = (0, _seq.first)($i) || 1;
	var ix = i.valueOf() - 1;
	return _checked($a, function (a) {
		if (a.size) return a.get(ix);
		return (0, _seq.seq)();
	});
}

function forEach($a, $f) {
	return t.forEach((0, _seq.first)($a), (0, _seq.first)($f));
}

function filter($a, $f) {
	return t.filter((0, _seq.first)($a), (0, _seq.first)($f));
}

function foldLeft($a, $z, $f) {
	return t.foldLeft((0, _seq.first)($a), $z, (0, _seq.first)($f));
}