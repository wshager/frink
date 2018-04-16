"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.array = array;
exports.join = join;
exports._checked = _checked;
exports.head = head;
exports.tail = tail;
exports.size = size;
exports.subarray = subarray;
exports.insertBefore = insertBefore;
exports.pop = pop;
exports.set = set;
exports.remove = remove;
exports.append = append;
exports.reverse = reverse;
exports.flatten = flatten;
exports.filter = filter;
exports.forEach = forEach;
exports.get = get;
exports.foldLeft = foldLeft;

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _error = require("./error");

var _seq = require("./seq");

var _util = require("./util");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var List = rrb.empty.constructor;

// TODO option: call ensureDoc and handle everything via VNode (i.e. persistent or not)
//import { ensureDoc } from "./doc";

//import { list } from "./access";

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

List.prototype.call = function ($, $k, $v) {
	var len = arguments.length;
	return len == 2 ? get(this, $k) : len == 3 ? set(this, $k, $v) : this;
};

module.exports.List = List;

function array() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	var l = a.length;
	if (l === 0) {
		return rrb.empty;
	}
	if (l == 1) {
		a = a[0];
		return (0, _seq.isSeq)(a) ? a.reduce(function (acc, a) {
			return acc.push(a);
		}, rrb.empty) : rrb.empty.push(a);
	}
	return a.reduce(function (acc, a) {
		return acc.push(a);
	}, rrb.empty);
}

function join($a) {
	if ($a === undefined) return (0, _error.error)("XPTY0004");
	// assume a sequence of vectors
	return (0, _seq.seq)($a).reduce(function (pre, cur) {
		// TODO force persistent cx
		//if (list()(cur)) cur = cur.toArray();
		if (!(0, _util.isList)(cur)) return (0, _error.error)("XPTY0004", "One of the items for array:join is not an array.");
		return rrb.concat(pre, cur);
	}, rrb.empty);
}

function _checked($a, fn) {
	if ($a === undefined) return (0, _error.error)("XPTY0004");
	return (0, _seq.forEach)((0, _seq.exactlyOne)($a), function (a) {
		return !(0, _util.isList)(a) ? (0, _error.error)("XPTY0004", "The provided item is not an array.") : fn(a);
	});
}

// TODO iterator to Observable using transducer protocol
// at the completion of the operation, create a new list
// array:transform($input, ... functions) => zeroOrOne()
// for now:
function head($a) {
	return _checked($a, function (a) {
		return rrb.get(a, 0);
	});
}

function tail($a) {
	return _checked($a, function (a) {
		return rrb.slice(a, 1);
	});
}

function size($a) {
	return _checked($a, function (a) {
		return a.count();
	});
}

function subarray($a, $s, $l) {
	return _checked($a, function (a) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($s), function (s) {
			s = s.valueOf() - 1;
			return (0, _util.isUndef)($l) ? rrb.slice(a, s) : (0, _seq.forEach)((0, _seq.exactlyOne)($l), function (l) {
				return rrb.slice(a, s, Math.max(s + Number(l), 0));
			});
		});
	});
}

var _insertBefore = function _insertBefore(a, i, v) {
	return a.slice(0, i).push(v).concat(a.slice(i));
};

function insertBefore($a, $i, $v) {
	return _checked($a, function (a) {
		return (0, _seq.forEach)($i, function (i) {
			return (0, _seq.forEach)(_seq.exactlyOne($v), function (v) {
				return _insertBefore(a, i - 1, v);
			});
		});
	});
}

var _remove = function _remove(a, i) {
	return a.slice(0, i - 1).concat(a.slice(i));
};

function pop($a) {
	return _checked($a, function (a) {
		return a.pop();
	});
}

function set($a, $i, $v) {
	return _checked($a, function (a) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($i), function (i) {
			return (0, _seq.forEach)((0, _seq.exactlyOne)($v), function(v) {
				return a.set(i, v);
			});
		});
	});
}

function remove($a, $i) {
	return _checked($a, function (a) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($i), function (i) {
			return _remove(a, i < 1 ? 1 : i);
		});
	});
}

function append($a, $v) {
	return _checked($a, function (a) {
		return _seq.forEach(_seq.exactlyOne($v),function(v) {
			return a.push(v);
		});
	});
}

function reverse($a) {
	return _checked($a, function (a) {
		return rrb.fromArray(a.toJS(true).reverse());
	});
}

function flatten($a) {
	return (0, _seq.seq)($a).mergeMap(function(a){
		return _seq.from(a);
	});
}

function filter($a, $fn) {
	return (0, _seq.filter)(flatten((0, _seq.exactlyOne)($a)), $fn).reduce(function (acc, x) {
		return acc.push(x);
	}, rrb.empty);
}

function forEach($a, $fn) {
	return (0, _seq.forEach)(flatten((0, _seq.exactlyOne)($a)), $fn).reduce(function (acc, x) {
		return acc.push(x);
	}, rrb.empty);
}

function get($a, $i) {
	if ((0, _util.isUndef)($i)) return (0, _error.error)("XPST0017");
	return _checked($a, function (a) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($i), function (i) {
			return a.size ? a.get(i - 1) : (0, _seq.seq)();
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
