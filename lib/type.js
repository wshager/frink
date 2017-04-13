"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.logic = exports.generalOperatorMap = exports.operatorMap = undefined;
exports.decimal = decimal;
exports.integer = integer;
exports.string = string;
exports.number = number;
exports.float = float;
exports.double = double;
exports.boolean = boolean;
exports.cast = cast;
exports.to = to;
exports.indexOf = indexOf;
exports.call = call;
exports._boolean = _boolean;
exports.op = op;
exports.data = data;
exports.instanceOf = instanceOf;
exports.minus = minus;
exports.round = round;
exports.floor = floor;

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

var _error = require("./error");

var _seq = require("./seq");

var _access = require("./access");

var _array = require("./array");

var _map = require("./map");

var _transducers = require("./transducers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO complete math (e.g. type checks for idiv and friends)

// one big pile
const operatorMap = exports.operatorMap = {
    "+": "plus",
    "-": "minus",
    "*": "times",
    "div": "dividedBy",
    "/": "dividedBy",
    "idiv": "dividedBy",
    "eq": "equals",
    "ne": "equals",
    "gt": "greaterThan",
    "lt": "lessThan",
    "ge": "greaterThanEquals",
    "le": "lessThanEquals",
    "&&": "and",
    "||": "or",
    "!": "not"
};

const generalOperatorMap = exports.generalOperatorMap = {
    ">": "greaterThan",
    "<": "lessThan",
    ">=": "greaterThanEquals",
    "<=": "lessThanEquals",
    "=": "equals",
    "!=": "equals"
};

class UntypedAtomic extends String {
    constructor(a) {
        super(a);
        this._value = a;
    }
    cast(other) {
        //If the atomic value is an instance of xdt:untypedAtomic
        //and the other is an instance of a numeric type,
        //then the xdt:untypedAtomic value is cast to the type xs:double.

        //If the atomic value is an instance of xdt:untypedAtomic
        //and the other is an instance of xdt:untypedAtomic or xs:string,
        //then the xdt:untypedAtomic value is cast to the type xs:string.

        //If the atomic value is an instance of xdt:untypedAtomic
        //and the other is not an instance of xs:string, xdt:untypedAtomic, or any numeric type,
        //then the xdt:untypedAtomic value is cast to the dynamic type of the other value.

        // NO-OP, moved elsewhere
    }
    toString() {
        return this._value.toString();
    }
    valueOf() {
        return this._value.valueOf();
    }
}

class Integer extends _big2.default {
    constructor(a) {
        super(a);
        this.constructor = Integer;
    }
}

class Float extends Number {
    constructor(a) {
        var temp = new Float32Array(1);
        temp[0] = +a;
        super(temp[0]);
        this._f = temp[0];
        this._d = a;
    }
    toString() {
        var temp = new Float64Array(1);
        temp[0] = +this._d;
        return temp[0].toString();
    }
    valueOf() {
        return this._f;
    }
}

const compProto = {
    equals(other) {
        return this.valueOf() === other.valueOf();
    },
    greaterThan(other) {
        return this.valueOf() > other.valueOf();
    },
    lessThan(other) {
        return this.valueOf() < other.valueOf();
    },
    greaterThanEquals(other) {
        return this.valueOf() >= other.valueOf();
    },
    lessThanEquals(other) {
        return this.valueOf() <= other.valueOf();
    }
};

const opProto = {
    plus(other) {
        return this + other;
    },
    minus(other) {
        return this - other;
    },
    times(other) {
        return this * other;
    },
    dividedBy(other) {
        return this / other;
    }
};

// mixin comparators
Object.assign(String.prototype, compProto);

Object.assign(Float.prototype, compProto, opProto);

Object.assign(Number.prototype, compProto, opProto);

Object.assign(Boolean.prototype, compProto);

// TODO decimal opt-in/out
const zeroInt = () => new _big2.default(0);
const zero = () => Number(0);
const emptyString = () => String();

// TODO create from Type classes
function decimal($a) {
    // type test
    if ($a === undefined) return;
    return cast($a, _big2.default, zeroInt);
}

function integer($a) {
    return cast((0, _transducers.forEach)($a, Math.floor), Integer, zeroInt);
}

function string($a) {
    // type test
    return (0, _seq.isSeq)($a) || (0, _access.isNode)($a) ? data($a) : cast($a, String, emptyString);
}

function number($a) {
    // type test
    return cast($a, Number, zero);
}

function float($a) {
    // type test
    return cast($a, Float, zero);
}

function double($a) {
    // type test
    return cast($a, Number, zero);
}

function boolean($a) {
    // type test
    try {
        return _boolean($a);
    } catch (e) {
        return e;
    }
}

function cast($a, $b) {
    if ((0, _seq.isSeq)($a)) return op($a, _cast, $b);
    return _cast($a, $b);
}

function _convert(a, type) {
    if (a !== undefined && a.constructor !== type) {
        return _cast(a, type);
    }
    return a;
}

function _cast(a, b) {
    if (a.constructor !== b) a = new b(a.toString());
    return a;
}

function to($a, $b) {
    let a = (0, _seq.first)($a);
    let b = (0, _seq.first)($b);
    a = a !== undefined ? +a.valueOf() : 0;
    b = b !== undefined ? +b.valueOf() : 0;
    return range(a, b + 1);
}

function indexOf($a, $b) {
    $a = (0, _seq.first)($a);
    $b = (0, _seq.first)($b);
    return $a.findKeys(function (i) {
        return _boolean($b.op("equals", i));
    });
}

function call(...a) {
    let f = (0, _seq.first)(a[0]);
    let args = a.slice(1);
    if ((0, _array.isArray)(f)) {
        return f.get((0, _seq.first)(a[1]) - 1);
    } else if ((0, _map.isMap)(f)) {
        var key = (0, _seq.first)(a[1]);
        return f.get(key);
    } else {
        return f.apply(this, args);
    }
}

function numbertest(a) {
    var c = a.constructor;
    if (c == String || c == Boolean) return;
    return true;
}

function _op(op, invert, a, b) {
    var ret;
    if (a !== undefined) {
        if (typeof a[op] == "function") {
            if (!numbertest(a)) return (0, _error.error)("err:XPTY0004", a.constructor.name + "(" + a + ") can not be operand for " + op);
            if (!numbertest(b)) return (0, _error.error)("err:XPTY0004", b.constructor.name + "(" + b + ") can not be operand for " + op);
            var ab = _promote(a, b);
            if (ab instanceof Error) {
                return ab;
            }
            a = ab[0];
            b = ab[1];
            ret = a[op](b);
        } else {
            throw new Error("Operator " + op + " not implemented");
        }
    }
    return invert ? !ret : ret;
}

function _comp(op, invert, a, b) {
    var ret;
    if (a !== undefined) {
        if (typeof a[op] == "function") {
            var ab = _promote(a, b);
            if (ab instanceof Error) {
                return ab;
            }
            a = ab[0];
            b = ab[1];
            ret = a[op](b);
        } else {
            throw new Error("Operator " + op + " not implemented for " + a + " (" + a.constructor.name + ")");
        }
    }
    //console.log(a,b,op,ret);

    return invert ? !ret : ret;
}

function _promote(a, b) {
    // TODO FIXME use JS type casting! 1 == "1"
    //If each operand is an instance of one of the types xs:string or xs:anyURI, then both operands are cast to type xs:string.
    //If each operand is an instance of one of the types xs:decimal or xs:float, then both operands are cast to type xs:float.
    //If each operand is an instance of one of the types xs:decimal, xs:float, or xs:double, then both operands are cast to type xs:double.
    var c = a.constructor,
        d = b.constructor;
    if (c == Number || d == Number) {
        if (c == Integer || c == _big2.default || c == Float || c == UntypedAtomic) {
            a = +a.toString();
            c = Number;
        }
        if (d == Integer || d == _big2.default || d == Float || d == UntypedAtomic) {
            b = +b.toString();
            d = Number;
        }
    }
    if (c == Integer || d == Integer) {
        if (c == _big2.default || c == UntypedAtomic) {
            a = c == UntypedAtomic ? new Integer(a.toString()) : a;
            c = Integer;
        }
        if (d == _big2.default || d == UntypedAtomic) {
            b = d == UntypedAtomic ? new Integer(b.toString()) : b;
            d = Integer;
        }
    }
    if (c == String || d == String) {
        if (c == UntypedAtomic) {
            a = a.toString();
            c = String;
        }
        if (d == UntypedAtomic) {
            b = a.toString();
            d = String;
        }
    }
    if (c != d) {
        //throw new Error("Cannot compare operands: " + c.name + " and " + d.name);
        return (0, _error.error)("err:XPTY0004", "Cannot compare operands: " + c.name + " and " + d.name);
    }
    return [a, b];
}

function _opReducer(iterable, opfn, other, general) {
    var otherIsSeq = (0, _seq.isSeq)(other);
    if (general) {
        return (0, _transducers.foldLeft)(iterable, false, function (acc, v) {
            return acc || (otherIsSeq ? (0, _transducers.foldLeft)(other, false, function (pre, cur) {
                return pre || opfn(v, cur);
            }) : opfn(v, other));
        });
    } else if (!(0, _seq.isSeq)(iterable) || iterable.size == 1) {
        let b = otherIsSeq ? (0, _seq.first)(other) : other;
        return opfn((0, _seq.first)(iterable), b);
    } else {
        return (0, _transducers.forEach)(iterable, function (v) {
            return otherIsSeq ? (0, _transducers.foldLeft)(other, false, function (pre, cur) {
                return pre || opfn(v, cur);
            }) : opfn(v, other);
        });
    }
}

// TODO without eval!
function isNodeSeq($a) {
    return node((0, _seq.first)($a));
}

// FIXME the unmarshalling of seqs is probably more efficient than anything else...
// EXCEPT a filter + a lazy foldRight maybe
function _boolean($a) {
    var a = (0, _seq.first)($a);
    if ((0, _seq.isEmpty)(a)) return false;
    if ($a.size > 1 && !(0, _access.isNode)(a)) {
        throw (0, _error.error)("err:FORG0006");
    }
    return a.valueOf();
}

const logic = exports.logic = {
    and: function and($a, $b) {
        return _boolean($a) && _boolean($b);
    },
    or: function or($a, $b) {
        return _boolean($a) || _boolean($b);
    },
    not: function not($a) {
        return !(0, _seq.first)($a);
    }
};

const opinv = {
    ne: true,
    '!=': true
};
function op($a, operator, $b) {
    var invert = false,
        comp = false,
        general = false,
        hasOp = false,
        operatorName;
    var opfn;
    if (typeof operator == "string") {
        invert = opinv[operator];
        hasOp = operator in operatorMap;
        if (!hasOp) {
            general = operator in generalOperatorMap;
            if (!general) return (0, _error.error)("xxx", "No such operator");
            operatorName = generalOperatorMap[operator];
        } else {
            operatorName = operatorMap[operator];
        }
        if (logic[operatorName]) {
            return logic[operatorName]($a, $b);
        } else {
            comp = compProto.hasOwnProperty(operatorName);
            opfn = comp ? _comp.bind(null, operatorName, invert) : _op.bind(null, operatorName, invert);
        }
        if (comp) {
            $a = data($a);
            $b = data($b);
        }
        if (!general) {
            if ((0, _seq.isEmpty)($a)) return $a;
            if ((0, _seq.isEmpty)($b)) return $b;
            // FIXME NOT! allow arithmetic on sequences (why not?)...
            // FIXME reduce when comp result is seq of booleans
            if ($b.size > 1) return (0, _error.error)("err:XPTY0004");
        }
    } else if (typeof operator == "function") {
        opfn = operator;
    } else {
        return (0, _error.error)("xxx", "No such operator");
    }
    return _opReducer($a, opfn, $b, general);
}

function data($a) {
    return dataImpl($a);
}

function dataImpl(node, fltr = false) {
    var ret;
    if ((0, _seq.isSeq)(node)) {
        if ((0, _seq.isEmpty)(node)) return node;
        //ret = node.map(_ => dataImpl(_, fltr)).filter(_ => _ !== undefined);
        var a = (0, _transducers.transform)(node, (0, _transducers.compose)((0, _transducers.forEach)(_ => dataImpl(_, fltr)), (0, _transducers.filter)(_ => undefined !== _)));
        if (!a.size) {
            ret = (0, _seq.seq)(new UntypedAtomic(""));
        } else {
            ret = a;
        }
        return ret;
    }
    if ((0, _access.isEmptyNode)(node)) return undefined;
    if (!(0, _access.isNode)(node)) return node;
    var type = node.type;
    if (fltr && fltr === type) return undefined;
    if (type === 1) {
        ret = node.map(_ => dataImpl(_, 2)).filter(_ => _ !== undefined);
    } else {
        ret = node.value;
        if (typeof ret == "string") {
            ret = !ret ? undefined : _cast(ret, UntypedAtomic);
        }
    }
    return ret;
}

function instanceOf($a, $b) {
    let a = (0, _seq.first)($a);
    let b = (0, _seq.first)($b);
    var t = a === undefined || b === undefined ? false : a.constructor === b.constructor;
    return t;
}

function minus($a) {
    var a = (0, _seq.first)($a);
    if (typeof a.neg == "function") return a.neg();
    return -a;
}

function round($a) {
    let a = (0, _seq.first)($a);
    if (!a) return integer(0);
    return integer(typeof a.round == "function" ? a.round() : Math.round(a));
}

function floor($a) {
    let a = (0, _seq.first)($a);
    if (!a) return integer(0);
    return integer(typeof a.floor == "function" ? a.floor() : Math.floor(a));
}