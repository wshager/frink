"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.merge = undefined;
exports.isMap = isMap;
exports.default = exports.map = construct;
exports.put = put;
exports.keys = keys;
exports.contains = contains;
exports.size = size;
exports.forEachEntry = forEachEntry;
exports.entry = entry;
exports.get = get;
exports.remove = remove;

var _ohamt = require("ohamt");

var ohamt = _interopRequireWildcard(_ohamt);

var _seq = require("./seq");

var _util = require("./util");

var _access = require("./access");

var _error = require("./error");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//import { eq } from "./op";

var OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype._type = 6;

OrderedMap.prototype["@@transducer/init"] = function () {
	return ohamt.empty;
};

OrderedMap.prototype["@@transducer/step"] = function (m, kv) {
	return m.append(kv[0], kv[1]);
};

OrderedMap.prototype["@@transducer/result"] = function (m) {
	return m;
};

OrderedMap.prototype.call = function($,...a) {
	const len = a.length;
	let [k,v] = a;
	console.log("get",k);
	return _seq.forEach(_seq.exactlyOne(this), function(s) {
		if(len == 1) return _seq.forEach(_seq.exactlyOne(k), k => {
			const v = s.get(k);
			return _util.isUndef(v) ? _seq.seq() : v;
		});
		if(len == 2) return _seq.forEach(_seq.exactlyOne(k), k => s.set(k,v));
	});
};

function isMap(maybe) {
	return !!(maybe && maybe.__is_Map);
}
module.exports.fromEntries = fromEntries;
module.exports.Map = OrderedMap;
function fromEntries(entries) {
	var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _create();

	m = m.beginMutation();
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var kv = _step.value;
			m = m.set(kv[0], kv[1]);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return m.endMutation();
}

var _create = function _create() {
	return ohamt.make({
		keyEq: function keyEq(x, y) {
			return x instanceof Object && "eq" in x ? x.eq(y) : x === y;
		}
	});
};

function construct() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	var l = a.length;
	if (l === 0) {
		return (0, _seq.seq)(_create());
	}
	if (l == 1) {
		var s = a[0];
		if ((0, _seq.isSeq)(s)) return merge(s);
		if (isMap(s)) return s;
		if(Array.isArray(s)) return fromEntries(s);
		if ((0, _util.isObject)(s)) return fromEntries(Object.entries(s));
		// TODO VNode conversion + detect tuple
		//if ((0, _access.map)()(s)) return s.toMap();
		return (0, _error.error)("XXX", "Not a map or tuple");
	}
	// expect a sequence of maps or each argument to be a map
	return merge((0, _seq.seq)(a.map(function (x) {
		return (0, _seq.seq)(x);
	})).concatAll());
}

var merge = exports.merge = function merge($m) {
	if ($m === undefined) return (0, _error.error)("XPTY0004");
	// assume a sequence of vectors
	return $m.reduce(function (pre, cur) {
		// TODO force persistent cx
		//if ((0, _access.map)()(cur)) cur = cur.toMap();
		if (!isMap(cur)) {
			return (0, _error.error)("XPTY0004", "One of the items for map:merge is not a map.");
		}
		return fromEntries(cur, pre);
	}, _create());
};

function put($m, $k, $v) {
	return _seq.forEach((0, _seq.exactlyOne)($m),function (m) {
		return _seq.forEach((0, _seq.exactlyOne)($k),function (k) {
			return m.set(k, $v);
		});
	});
}

function _checked($map,fn,$k) {
	//const seqArgs = args.filter(x => _seq.isSeq(x));
	return _seq.forEach(_seq.exactlyOne($map),m => {
		return _seq.forEach(_seq.exactlyOne($k),k => {
			return fn(m,k);
		});
	});
}

function keys($m) {
	return (0, _seq.exactlyOne)($m).concatMap(function (m) {
		return m.keys();
	});
}

function contains($m, $k) {
	return _checked($m,(m,k) => m.has(k),_seq.exactlyOne($k));
}

function size($m) {
	return (0, _seq.exactlyOne)($m).map(function (m) {
		return m.count();
	});
}

function forEachEntry($m, $fn) {
	return (0, _seq.exactlyOne)($fn).concatMap(function (fn) {
		return (0, _seq.exactlyOne)($m).concatMap(function (m) {
			return m.entries();
		}).concatMap(function (kv) {
			return fn((0, _seq.seq)(kv[0]), (0, _seq.seq)(kv[1]));
		});
	});
}

function entry($k, $v) {
	// TODO template errors
	return _seq.forEach($k,function (k) {
		var m = _create();
		return m.set(k,$v);
	});
}

function get($m, $k) {
	return _seq.forEach((0, _seq.exactlyOne)($m),function (m) {
		return _seq.forEach((0, _seq.exactlyOne)($k),function (k) {
			return m.get(k);
		});
	});
}

function remove($m, $k) {
	return _seq.forEach((0, _seq.exactlyOne)($m),function (m) {
		return _seq.forEach((0, _seq.exactlyOne)($k),function (k) {
			return m.delete(k);
		});
	});
}
