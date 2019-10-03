"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.array = array;
exports.join = join;
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

var rrb = _interopRequireWildcard(require("rrb-vector"));

var _error = require("./error");

var _rxjs = require("rxjs");

var _seq = require("./seq");

var _iterUtil = require("./iter-util");

var _util = require("./util");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// TODO option: call ensureDoc and handle everything via VNode (i.e. persistent or not)
//import { ensureDoc } from "./doc";
//import { list } from "./access";
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

List.prototype.call = function ($, $k, $v) {
  const len = arguments.length;
  return len == 2 ? get(this, $k) : len == 3 ? set(this, $k, $v) : this;
};

module.exports.List = List;

function array(...a) {
  const l = a.length;

  if (l === 0) {
    return rrb.empty;
  }

  if (l == 1) {
    a = a[0];
    const f = (0, _seq.isSeq)(a) ? _seq.foldLeft : _iterUtil.foldLeft;
    return f(rrb.empty, (acc, a) => acc.push(a))(a);
  }

  return a.reduce((acc, a) => acc.push(a), rrb.empty);
}

function join($a) {
  if ($a === undefined) return (0, _error.error)("XPTY0004"); // assume a sequence of vectors

  return (0, _seq.foldLeft)(rrb.empty, (pre, cur) => {
    // TODO force persistent cx
    //if (list()(cur)) cur = cur.toArray();
    //if (!isList(cur)) return error("XPTY0004", "One of the items for array:join is not an array.");
    return rrb.concat(pre, cur);
  })($a);
} // TODO iterator to Observable using transducer protocol
// at the completion of the operation, create a new list
// array:transform($input, ... functions) => zeroOrOne()
// for now:


function head(a) {
  return rrb.get(a, 0);
}

function tail(a) {
  return rrb.slice(a, 1);
}

function size(a) {
  return a.count();
}

function subarray(a, s, l) {
  s = s - 1;
  return (0, _util.isUndef)(l) ? rrb.slice(a, s) : rrb.slice(a, s, Math.max(s + Number(l), 0));
}

function insertBefore(a, i, v) {
  i = i - 1;
  return a.slice(0, i).push(v).concat(a.slice(i));
}

function pop(a) {
  return a.pop();
}

function set(a, i, v) {
  return a.set(i, v);
}

function remove(a, i) {
  return a.slice(0, i - 1).concat(a.slice(i));
}

function append(a, v) {
  return a.push(v);
}

function reverse(a) {
  return rrb.fromArray(a.toJS(true).reverse());
}

function flatten(a) {
  return (0, _rxjs.from)(a);
}

function filter(a, fn) {
  return (0, _seq.filter)(flatten(a), fn).reduce((acc, x) => acc.push(x), rrb.empty);
}

function forEach(a, fn) {
  return (0, _seq.forEach)(flatten(a), fn).reduce((acc, x) => acc.push(x), rrb.empty);
}

function get(a, i) {
  return a.size ? a.get(i - 1) : null;
}

function foldLeft(a, z, f) {
  return (0, _seq.foldLeft)(flatten(a), z, f);
}
//# sourceMappingURL=array.js.map