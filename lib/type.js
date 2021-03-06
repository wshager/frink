"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.castAs = castAs;
exports.to = to;
exports.call = call;
exports.and = and;
exports.or = or;
exports.op = op;
exports.data = data;
exports.a = exports.e = exports.l = exports.m = exports.double = exports.float = exports.number = exports.string = exports.integer = exports.decimal = exports.generalOperatorMap = exports.operatorMap = void 0;

var _big = _interopRequireDefault(require("big.js"));

var _integer = _interopRequireDefault(require("./types/integer"));

var _float = _interopRequireDefault(require("./types/float"));

var _untypedAtomic = _interopRequireDefault(require("./types/untyped-atomic"));

var _opProto = _interopRequireDefault(require("./types/op-proto"));

var _compProto = _interopRequireDefault(require("./types/comp-proto"));

var _value = require("./string/value");

var _error = require("./error");

var _seq = require("./seq");

var _array = require("./array");

var _map = require("./map");

var _util = require("./util");

var _l3n = require("l3n");

var _value2 = require("./boolean/value");

var impl = _interopRequireWildcard(require("./impl"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO complete math (e.g. type checks for idiv and friends)
// one big pile
const operatorMap = {
  "+": "plus",
  "-": "minus",
  "*": "times",
  "div": "div",
  "/": "div",
  "idiv": "div",
  "eq": "eq",
  "ne": "eq",
  "gt": "gt",
  "lt": "lt",
  "ge": "gte",
  "le": "gte",
  "&&": "and",
  "||": "or",
  "!": "not"
};
exports.operatorMap = operatorMap;
const unaryOperatorMap = {
  "-": "neg"
};
const generalOperatorMap = {
  ">": "gt",
  "<": "lt",
  ">=": "gte",
  "<=": "lte",
  "=": "eq",
  "!=": "eq"
}; // mixin comparators

exports.generalOperatorMap = generalOperatorMap;
Object.assign(String.prototype, _compProto.default);
Object.assign(_float.default.prototype, _compProto.default, _opProto.default);
Object.assign(Number.prototype, _compProto.default, _opProto.default);
Object.assign(Boolean.prototype, _compProto.default); // TODO decimal opt-in/out

const ap10 = (a, b) => b(a);

const asType = (cc, ifEmpty = null, prep = ap10) => a => (0, _util.isUndef)(a) ? cc : (0, _util.isNull)(a) ? ifEmpty : prep(a, cc); // TODO create from Type classes


const decimal = asType(_big.default);
exports.decimal = decimal;
const integer = asType(_integer.default);
exports.integer = integer;
const string = asType(String, "", a => (0, _l3n.isVNode)(a) ? data(a).toString() : a.toString());
exports.string = string;
const number = asType(Number, NaN, a => +a); // 32-bits float

exports.number = number;
const float = asType(_float.default, NaN);
exports.float = float;
const double = number;
exports.double = double;

function castAs(a, b) {
  return b(a);
}

function to(a, b) {
  return (0, _seq.range)(b, a);
}

function call(f, ...a) {
  if ((0, _util.isList)(f)) {
    return (0, _array.get)(f, a[0]);
  } else if ((0, _util.isMap)(f)) {
    return (0, _map.get)(f, a[0]);
  } else {
    return f(...a);
  }
}

function _binOp(op, invert, a, b) {
  var ret;

  if (a === undefined || b === undefined) {
    return (0, _error.error)("A value may never be undefined");
  }

  if (typeof a[op] == "function") {
    [a, b] = _promote(a, b);
    ret = a[op](b);
  } else {
    return (0, _error.error)("XPST0017", "Operator " + op + " not implemented");
  }

  return invert ? !ret : ret;
}

function _unaOp(op, invert, a) {
  var ret;

  if (a === undefined) {
    return (0, _error.error)("A value may never be undefined");
  }

  if (typeof a[op] == "function") {
    ret = a[op]();
  } else {
    return (0, _error.error)("XPST0017", "Operator " + op + " not implemented");
  }

  return invert ? !ret : ret;
}

function _promote(a, b) {
  // TODO use JS type casting: 1 == "1"
  //If each operand is an instance of one of the types xs:string or xs:anyURI, then both operands are cast to type xs:string.
  //If each operand is an instance of one of the types xs:decimal or xs:float, then both operands are cast to type xs:float.
  //If each operand is an instance of one of the types xs:decimal, xs:float, or xs:double, then both operands are cast to type xs:double.
  var c = a.constructor,
      d = b.constructor;

  if (c == Number || d == Number) {
    if (c == _integer.default || c == _big.default || c == _float.default || c == _untypedAtomic.default) {
      a = +a.toString();
      c = Number;
    }

    if (d == _integer.default || d == _big.default || d == _float.default || d == _untypedAtomic.default) {
      b = +b.toString();
      d = Number;
    }
  }

  if (c == _integer.default || d == _integer.default) {
    if (c == _big.default || c == _untypedAtomic.default) {
      a = c == _untypedAtomic.default ? new _integer.default(a.toString()) : a;
      c = _integer.default;
    }

    if (d == _big.default || d == _untypedAtomic.default) {
      b = d == _untypedAtomic.default ? new _integer.default(b.toString()) : b;
      d = _integer.default;
    }
  }

  if (c == String || d == String) {
    if (c == _untypedAtomic.default) {
      a = a.toString();
      c = String;
    }

    if (d == _untypedAtomic.default) {
      b = a.toString();
      d = String;
    }
  }

  return [a, b];
}

function generalComp(opfn, $a, $b) {
  return (0, _seq.pipe)((0, _seq.switchMap)(a => (0, _seq.forEach)(b => opfn(a, b))($b)), (0, _seq.first)(x => x, false))($a);
}
/**
 * expect functions
 */


function and($a, $b) {
  return (0, _seq.switchMap)((0, _value2.boolean)($a()), a => a ? (0, _seq.switchMap)((0, _value2.boolean)($b()), impl.and(a)) : false);
}

function or($a, $b) {
  return (0, _seq.switchMap)((0, _value2.boolean)($a()), a => a ? true : (0, _seq.switchMap)((0, _value2.boolean)($b()), impl.or(a)));
}

const logic = {
  and: and,
  or: or,
  not: _value2.not
};
const opinv = {
  ne: true,
  "!=": true
}; // NOTE cardinality tests should be taken care of by VM

function op($a, operator, $b) {
  var invert = false,
      comp = false,
      general = false,
      operatorName;
  var opfn;

  if (typeof operator == "string") {
    invert = opinv[operator];
    const hasUnaOp = (0, _util.isUndef)($b) && unaryOperatorMap.hasOwnProperty(operator);
    const hasOp = hasUnaOp || operatorMap.hasOwnProperty(operator);

    if (!hasOp) {
      general = operator in generalOperatorMap;
      if (!general) return (0, _error.error)("xxx", "No such operator");
      operatorName = generalOperatorMap[operator];
    } else {
      operatorName = hasUnaOp ? unaryOperatorMap[operator] : operatorMap[operator];
    }

    if (logic[operatorName]) {
      return logic[operatorName]($a, $b);
    } else if (hasUnaOp) {
      opfn = _unaOp.bind(null, operatorName, invert);
    } else {
      comp = _compProto.default.hasOwnProperty(operatorName);
      opfn = _binOp.bind(null, operatorName, invert);
    }

    if (comp) {
      const md = (0, _seq.forEach)(data);
      $a = md($a);
      $b = md($b);
    }
  } else if (typeof operator == "function") {
    opfn = operator;
  } else {
    return (0, _error.error)("XPST0017", "Unknown operator: " + operator);
  }

  if (general) return generalComp(opfn, $a, $b);
  if ((0, _util.isNull)($a) || (0, _util.isNull)($b)) return null;
  return opfn($a, $b);
}

function data($a) {
  return (0, _seq.switchMap)($a, a => {
    if ((0, _l3n.isVNode)(a)) {
      return new _untypedAtomic.default((0, _value.stringJoin)((0, _seq.pipe)((0, _seq.filter)(node => node.type == 2 || node.type == 3), (0, _seq.forEach)(node => impl.nodeData(node)))((0, _l3n.traverse)(a))));
    } else {
      return a;
    }
  });
}
/*
 * Pojo L3 constructors
 */


const has = (obj, prop) => obj.hasOwnProperty(prop);

const m = (...a) => a.reduce((o, {
  $key,
  $value
}) => {
  o[$key] = $value;
  return o;
}, {});

exports.m = m;

const l = (...a) => a;

exports.l = l;

const e = (qname, ...a) => {
  // check if first arg is attrMap
  const len = a.length;
  const node = {};
  node.$name = qname;
  node.$children = [];

  for (let i = 0; i < len; i++) {
    let c = a[i];
    if (typeof c == "function") c = c();

    if (has(c, "$key")) {
      node[c.$key] = c.$value;
    } else {
      node.$children.push(c);
    }
  }

  return node;
};

exports.e = e;

const a = (key, val) => ({
  $key: key,
  $value: val
});

exports.a = a;
//# sourceMappingURL=type.js.map