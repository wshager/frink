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
exports.forEachEntry = forEachEntry;
exports.entry = entry;
exports.get = get;

var _ohamt = require("ohamt");

var ohamt = _interopRequireWildcard(_ohamt);

var _seq = require("./seq");

var _error = require("./error");

var _transducers = require("./transducers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype["@@empty"] = function () {
	return ohamt.empty;
};

OrderedMap.prototype["@@append"] = function (kv) {
	return this.append(kv[0], kv[1]);
};

function isMap($maybe) {
	let maybe = _seq.first($maybe);
	return !!(maybe && maybe.__is_Map);
}

function map(...a) {
	var l = a.length;
	var m = ohamt.empty.beginMutation();
	if (l === 0) {
		return m.endMutation();
	}
	// expect a sequence of maps or each argument to be a map
	if (l == 1 && _seq.isSeq(a[0])) {
		a = a[0];
		if (_seq.isEmpty(a)) return m.endMutation();
	}
	return _transducers.into(a, _transducers.cat, m).endMutation();
}

const merge = exports.merge = map;

function put($map, $k, $v) {
	var k = _seq.first($k);
	var map = _seq.first($map);
	return map.set(k, _seq.isSeq($v) && $v.size > 1 ? $v : _seq.first($v));
}

function keys($map) {
	return _seq.seq(Array.from(_seq.first($map).keys()));
}

function contains($map, $k) {
	return _seq.first($map).has(_seq.first($k));
}

function forEachEntry($map, $fn) {
	let map = _seq.first($map);
	let fn = _seq.first($fn);
	var ret = _seq.seq();
	map.forEach(function (v, k) {
		ret = ret.push(fn(k, v));
	});
	return ret;
}

function entry(...a) {
	// TODO template errors
	if (a.length != 2) return _error.error("err:XPST0017", "Number of arguments of function map.entry doesn't match function signature (expected 2, got " + a.length + ")");
	var m = ohamt.empty,
	    k = _seq.first(a[0]),
	    v = a[1];
	return m.set(k.valueOf(), _seq.isSeq(v) && v.size > 1 ? v : _seq.first(v));
}

function get($map, $key) {
	var map = _seq.first($map);
	var k = _seq.first($key).valueOf();
	var v = map.get(k);
	return v !== undefined ? v : _seq.seq();
}