"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMap = isMap;
exports.default = exports.map = map;
exports.merge = merge;
exports.put = exports.set = set;
exports.keys = keys;
exports.contains = contains;
exports.size = size;
exports.forEachEntry = forEachEntry;
exports.entry = entry;
exports.get = get;
exports.remove = remove;
exports.fromEntries = void 0;

var ohamt = _interopRequireWildcard(require("ohamt"));

var _seq = require("./seq");

var _util = require("./util");

var _error = require("./error");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//import { map } from "./access";
//import { eq } from "./op";
const OrderedMap = ohamt.empty.constructor;
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
  const len = arguments.length;
  if (len == 2) return get(this, $k);
  if (len == 3) return set(this, $k, $v);
  return this;
};

function isMap(maybe) {
  return !!(maybe && maybe.__is_Map);
}

const fromEntries = (entries, m = _create()) => {
  m = m.beginMutation();

  for (const [k, v] of entries) m = m.set(k, v);

  return m.endMutation();
};

exports.fromEntries = fromEntries;

const _create = () => ohamt.make({
  keyEq: (x, y) => x instanceof Object && "eq" in x ? x.eq(y) : x === y
});

function map(...a) {
  var l = a.length;

  if (l === 0) {
    return _create();
  }

  if (l == 1) {
    var s = a[0];
    if ((0, _seq.isSeq)(s)) return merge(s);
    if (isMap(s)) return s;
    if ((0, _util.isObject)(s)) return fromEntries(Object.entries(s));
    if (Array.isArray(s)) return fromEntries(s); // TODO VNode conversion + detect tuple
    //if ((0, _access.map)()(s)) return s.toMap();

    return (0, _error.error)("XXX", "Not a map or tuple");
  } // expect a sequence of maps or each argument to be a map


  return merge((0, _seq.from)(a).mergeAll());
}

function merge($m) {
  if ($m === undefined) return (0, _error.error)("XPTY0004"); // assume a sequence of vectors

  return $m.reduce((pre, cur) => {
    // TODO force persistent cx
    //if ((0, _access.map)()(cur)) cur = cur.toMap();
    if (!isMap(cur)) {
      return (0, _error.error)("XPTY0004", "One of the items for map:merge is not a map.");
    }

    return fromEntries(cur, pre);
  }, _create());
}

function set(m, k, v) {
  return m.set(k, v);
}

function keys(m) {
  return m.keys();
}

function contains(m, k) {
  return m => m.has(k);
}

function size(m) {
  return m.count();
}

function forEachEntry(m, fn) {
  return (0, _seq.forEach)((0, _seq.from)(m.entries()), ([k, v]) => fn(k, v));
}

function entry(k, v) {
  // TODO template errors
  return fromEntries([[k, v]]);
}

function get(m, k) {
  return m.has(k) ? m.get(k) : null;
}

function remove(m, k) {
  return m.delete(k);
}
//# sourceMappingURL=map.js.map