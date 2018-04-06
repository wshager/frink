"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = exports.array = array;
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
exports.forEach = forEach;
exports.pop = pop;
exports.set = set;
exports.put = set;

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _error = require("./error");

var _seq = require("./seq");

var _access = require("./access");

var _util = require("./util");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// TODO option: call ensureDoc and handle everything via VNode (i.e. persistent or not)
//import { ensureDoc } from "./doc";

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

List.prototype.call = function($,$k,$v){
	const len = arguments.length;
	return len == 2 ? get(this,$k) : len == 3 ? set(this,$k,$v) : this;
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
	if(l == 1) {
		a = a[0];
		return _seq.isSeq(a) ? a.reduce((acc,a) => acc.push(a),rrb.empty) : rrb.empty.push(a);
	}
	return a.reduce(function (acc,a) {
		return acc.push(a);
	},rrb.empty);
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
	return _seq.forEach((0, _seq.exactlyOne)($a),function (a) {
		//if(!_util.isList(a)) require("./console").log(a);
		return !(0, _util.isList)(a) ? (0, _error.error)("XPTY0004", "The provided item is not an array.") : fn.bind(a, a).apply(a, args);
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
	return _seq.forEach((0, _seq.exactlyOne)($a),function (a) {
		return a.size;
	});
}

function subarray($a, $s, $l) {
	return _seq.forEach((0, _seq.exactlyOne)($a),function (a) {
		return _seq.forEach($s,function (s) {
			s = s.valueOf() - 1;
			return (0, _util.isUndef)($l) ? rrb.slice(a, s) : (0, _seq.seq)($l).map(function (l) {
				return rrb.slice(a, s, Math.max(s + Number(l), 0));
			});
		});
	});
}

var _insertBefore = function _insertBefore(a, i, v) {
	return a.slice(0, i).push(v).concat(a.slice(i));
};

function insertBefore($a, $i, $v) {
	return _seq.forEach($i,function (i) {
		return _seq.forEach(_seq.exactlyOne($a),function(a) {
			return _insertBefore(a, i - 1, $v);
		}).concatAll();
	});
}

var _remove = function _remove(a, i) {
	return a.slice(0, i - 1).concat(a.slice(i));
};

function pop($a) {
	return _seq.forEach(_seq.exactlyOne($a),function(a) {
		return a.pop();
	});
}

function set($a,$i,$v) {
	return _seq.forEach(_seq.exactlyOne($i), function (i) {
		return _seq.forEach(_seq.exactlyOne($a),function(a) {
			return a.set(i,$v);
		});
	});
}

function remove($a, $i) {
	return _seq.forEach(_seq.exactlyOne($i),function (i) {
		return _seq.forEach(_seq.exactlyOne($a), function (a) {
			return _remove(a, i < 1 ? 1 : i);
		});
	});
}

function append($a, $v) {
	return _seq.forEach(_seq.exactlyOne($a), function (a) {
		return a.push($v);
	});
}

function reverse($a) {
	return _seq.forEach(_seq.exactlyOne($a),function(a) {
		return rrb.fromArray(a.toJS(true).reverse());
	});
}

function flatten($a) {
	return $a.mergeAll();
}

function filter($a,$fn) {
	return _seq.filter(_seq.exactlyOne($a).concatAll(),$fn).reduce((acc,x) => acc.push(x),rrb.empty);
}

function forEach($a,$fn) {
	return _seq.forEach(_seq.exactlyOne($a).concatAll(),$fn).reduce((acc,x) => acc.push(x),rrb.empty);
}

module.exports.filter = filter;

function get($a, $i) {
	if ((0, _util.isUndef)($i)) return (0, _error.error)("XPST0017");
	return _seq.forEach((0, _seq.exactlyOne)($i),function (i) {
		return _seq.forEach(_seq.exactlyOne($a),function (a) {
			if (a.size) return a.get(i - 1);
			return _seq.seq();
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
