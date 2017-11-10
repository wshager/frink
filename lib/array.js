"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
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
exports.foldLeft = foldLeft;

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _error = require("./error");

var _seq = require("./seq");

var _doc = require("./doc");

var _access = require("./access");

var _util = require("./util");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var List = rrb.empty.constructor;

// TODO option: call ensureDoc and handle everything via VNode (i.e. persistent or not)


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

function array() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	var l = a.length;
	if (l === 0) {
		return (0, _seq.seq)(rrb.empty);
	}
	if (l == 1) {
		var s = a[0];
		if ((0, _seq.isSeq)(s)) return s;
		if ((0, _util.isList)(s)) return (0, _seq.of)(s);
		if ((0, _util.isArray)(s)) return (0, _seq.of)(rrb.fromArray(s));
		// TODO VNode conversion
		if ((0, _access.list)()(s)) return (0, _seq.of)(s.toArray());
		return rrb.empty.push(s);
	}
	return join((0, _seq.seq)(a.map(_seq.of)).concatAll().map(function (a) {
		return array(a);
	}));
}

function join($a) {
	if ($a === undefined) return (0, _error.error)("XPTY0004");
	// assume a sequence of vectors
	return $a.reduce(function (pre, cur) {
		// TODO force persistent cx
		if ((0, _access.list)()(cur)) cur = cur.toArray();
		if (!(0, _util.isList)(cur)) return (0, _error.error)("XPTY0004", "One of the items for array:join is not an array.");
		return rrb.concat(pre, cur);
	}, rrb.empty);
}

function _checked($a, fn) {
	for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
		args[_key2 - 2] = arguments[_key2];
	}

	if ($a === undefined) return (0, _error.error)("XPTY0004");
	return (0, _seq.exactlyOne)($a).concatMap(function (a) {
		return !(0, _util.isList)(a) ? (0, _error.error)("XPTY0004", "The provided item is not an array.") : (0, _seq.seq)(fn.bind(a, a).apply(a, args));
	});
}

// TODO iterator to Observable using transducer protocol
// at the completion of the operation, create a new list
// array:transform($input, ... functions) => zeroOrOne()
// for now:
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
	return (0, _seq.exactlyOne)($a).concatMap(function (a) {
		return (0, _seq.seq)($s).concatMap(function (s) {
			s = s.valueOf() - 1;
			return (0, _util.isUndef)($l) ? rrb.slice(a, s) : (0, _seq.seq)($l).map(function (l) {
				return rrb.slice(a, s, Math.max(s + Number(l), 0));
			});
		});
	});
}

var _singleOrSeq = function _singleOrSeq($v, fn) {
	$v = (0, _seq.seq)($v);
	return (0, _seq.isExactlyOne)($v).switchMap(function (test) {
		return test ? $v.map(fn) : fn($v);
	});
};

var _insertBefore = function _insertBefore(a, i, v) {
	return a.slice(0, i).push(v).concat(a.slice(i));
};

function insertBefore($a, $i, $v) {
	return (0, _seq.seq)($i).concatMap(function (i) {
		return _checked($a, function (a) {
			return _singleOrSeq($v, _insertBefore.bind(a, a, i - 1));
		}).concatAll();
	});
}

var _remove = function _remove(a, i) {
	return a.slice(0, i - 1).concat(a.slice(i));
};

function remove($a, $i) {
	return (0, _seq.seq)($i).concatMap(function (i) {
		return _checked($a, function (a) {
			return _remove(a, i < 1 ? 1 : i);
		});
	});
}

function append($a, $v) {
	return _checked($a, function (a) {
		return _singleOrSeq($v, rrb.push.bind(a, a));
	}).concatAll();
}

function reverse($a) {
	return _checked($a, function (a) {
		return rrb.fromArray(a.toJS(true).reverse());
	});
}

function flatten($a) {
	return $a.concatAll();
}

function get($a, $i) {
	if ((0, _util.isUndef)($i)) return (0, _error.error)("XPST0017");
	return (0, _seq.exactlyOne)($i).concatMap(function (i) {
		return _checked($a, function (a) {
			if (a.size) return a.get(i - 1);
			//return seq();
		});
	});
}

function foldLeft($a, $z, $f) {
	if ((0, _util.isUndef)($f)) {
		$f = $z;
		$z = undefined;
	}
	return (0, _seq.foldLeft)(flatten((0, _seq.exactlyOne)($a)), $z, $f);
}