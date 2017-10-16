"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.merge = undefined;
exports.isMap = isMap;
exports.default = map;
exports.put = put;
exports.keys = keys;
exports.contains = contains;
exports.size = size;
exports.forEachEntry = forEachEntry;
exports.entry = entry;
exports.get = get;

var _ohamt = require("ohamt");

var ohamt = _interopRequireWildcard(_ohamt);

var _seq = require("./seq");

var _error = require("./error");

var _transducers = require("./transducers");

var _op = require("./op");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype._type = 6;

OrderedMap.prototype["@@transducers/init"] = function () {
	return ohamt.empty;
};

OrderedMap.prototype["@@transducers/step"] = function (m, kv) {
	return m.append(kv[0], kv[1]);
};

OrderedMap.prototype["@@transducers/result"] = function (m) {
	return m;
};

function isMap($maybe) {
	var maybe = (0, _seq.first)($maybe);
	return !!(maybe && maybe.__is_Map);
}

function map() {
	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	var l = a.length;
	var m = ohamt.make({
		keyEq: function keyEq(x, y) {
			return (0, _op.eq)(x, y);
		}
	}).beginMutation();
	if (l === 0) {
		return m.endMutation();
	}
	// expect a sequence of maps or each argument to be a map
	if (l == 1 && (0, _seq.isSeq)(a[0])) {
		a = a[0];
		if (!a.size) return m.endMutation();
	}
	return (0, _transducers.into)(a, _transducers.cat, m).endMutation();
}

var merge = exports.merge = map;

function put($map, $k, $v) {
	var k = (0, _seq.first)($k);
	var map = (0, _seq.first)($map);
	return map.set(k, (0, _seq.isSeq)($v) && $v.size != 1 ? $v : (0, _seq.first)($v).valueOf());
}

function keys($map) {
	return (0, _seq.seq)((0, _seq.first)($map).keys());
}

function contains($map, $k) {
	return (0, _seq.first)($map).has((0, _seq.first)($k));
}

function size($map) {
	return (0, _seq.first)($map).size;
}

function forEachEntry($map, $fn) {
	var map = (0, _seq.first)($map);
	var fn = (0, _seq.first)($fn);
	var ret = (0, _seq.seq)();
	map.forEach(function (v, k) {
		ret = ret.push(fn(k, v));
	});
	return ret;
}

function entry() {
	// TODO template errors
	if (arguments.length != 2) return (0, _error.error)("err:XPST0017", "Number of arguments of function map.entry doesn't match function signature (expected 2, got " + arguments.length + ")");
	var m = ohamt.empty,
	    k = (0, _seq.first)(arguments.length <= 0 ? undefined : arguments[0]),
	    v = arguments.length <= 1 ? undefined : arguments[1];
	return m.set(k, (0, _seq.isSeq)(v) && v.size != 1 ? v : (0, _seq.first)(v).valueOf());
}

function get($map, $key) {
	var map = (0, _seq.first)($map);
	var k = (0, _seq.first)($key);
	var v = map.get(k);
	return v !== undefined ? v : (0, _seq.seq)();
}