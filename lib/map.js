"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = exports.put = exports.fromEntries = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

//import { map } from "./access";

exports.isMap = isMap;
exports.map = map;
exports.merge = merge;
exports.set = set;
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

OrderedMap.prototype.call = function ($, $k, $v) {
	var len = arguments.length;
	if (len == 2) return get(this, $k);
	if (len == 3) return set(this, $k, $v);
	return this;
};

function isMap(maybe) {
	return !!(maybe && maybe.__is_Map);
}

var fromEntries = exports.fromEntries = function fromEntries(entries) {
	var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _create();

	m = m.beginMutation();
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _ref = _step.value;

			var _ref2 = _slicedToArray(_ref, 2);

			var k = _ref2[0];
			var v = _ref2[1];
			m = m.set(k, v);
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
};

var _create = function _create() {
	return ohamt.make({
		keyEq: function keyEq(x, y) {
			return x instanceof Object && "eq" in x ? x.eq(y) : x === y;
		}
	});
};

function map() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	var l = a.length;
	if (l === 0) {
		return _create();
	}
	if (l == 1) {
		var s = a[0];
		if ((0, _seq.isSeq)(s)) return merge(s);
		if (isMap(s)) return s;
		if ((0, _util.isObject)(s)) return fromEntries(Object.entries(s));
		if (Array.isArray(s)) return fromEntries(s);
		// TODO VNode conversion + detect tuple
		//if ((0, _access.map)()(s)) return s.toMap();
		return (0, _error.error)("XXX", "Not a map or tuple");
	}
	// expect a sequence of maps or each argument to be a map
	//console.log(a);
	return merge(_seq.from(a).mergeAll());
}

function merge($m) {
	if ($m === undefined) return (0, _error.error)("XPTY0004");
	//console.log("M",$m);
	// assume a sequence of vectors
	return _seq.foldLeft($m, _create(),function (pre, cur) {
		// TODO force persistent cx
		//if ((0, _access.map)()(cur)) cur = cur.toMap();
		if (!isMap(cur)) {
			return (0, _error.error)("XPTY0004", "One of the items for map:merge is not a map.");
		}
		return fromEntries(cur, pre);
	});
}

var _checked = function _checked($m, fn) {
	if ($m === undefined) return (0, _error.error)("XPTY0004");
	return (0, _seq.forEach)((0, _seq.exactlyOne)($m), function (m) {
		return !isMap(m) ? (0, _error.error)("XPTY0004", "The provided item is not a map.") : fn(m);
	});
};

function set($m, $k, $v) {
	return _checked($m, function (m) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($k), function (k) {
			return (0, _seq.forEach)((0, _seq.exactlyOne)($v), function (v) {
				return m.set(k, v);
			});
		});
	});
}

function keys($m) {
	return _checked($m, function (m) {
		return m.keys();
	});
}

function contains($m, $k) {
	return _checked($m, function (m) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($k), function (k) {
			return m.has(k);
		});
	});
}

function size($m) {
	return _checked($m, function (m) {
		return m.count();
	});
}

function forEachEntry($m, $fn) {
	return _checked($m, function (m) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($fn), function (fn) {
			return (0, _seq.forEach)((0, _seq.from)(m.entries()), function (_ref3) {
				var _ref4 = _slicedToArray(_ref3, 2),
				    k = _ref4[0],
				    v = _ref4[1];

				return fn(k, v);
			});
		});
	});
}

function entry($k, $v) {
	// TODO template errors
	return (0, _seq.forEach)(_seq.exactlyOne($k), function (k) {
		return (0, _seq.forEach)(_seq.exactlyOne($v), function (v) {
			return fromEntries([[k,v]]);
		});
	});
}

function get($m, $k) {
	return _checked($m, function (m) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($k), function (k) {
			return m.has(k) ? m.get(k) : (0, _seq.seq)();
		});
	});
}

function remove($m, $k) {
	return _checked($m, function (m) {
		return (0, _seq.forEach)((0, _seq.exactlyOne)($k), function (k) {
			return m.delete(k);
		});
	});
}

exports.put = set;
exports.default = map;
