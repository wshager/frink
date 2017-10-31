import Decimal from "big.js";

import {
	error
} from "./error";

import { seq, first, empty, range, zeroOrOne, exactlyOne } from "./seq";

import { isVNode, isEmptyNode, vdoc } from "./access";

import { isArray, get as aGet } from "./array";

import { isMap, get as mGet } from "./map";

import { isUndef, isUndefOrNull } from "./util";

// TODO complete math (e.g. type checks for idiv and friends)

// one big pile
export const operatorMap = {
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

export const generalOperatorMap = {
	">": "gt",
	"<": "lt",
	">=": "gte",
	"<=": "lte",
	"=": "eq",
	"!=": "eq"
};

class UntypedAtomic extends String {
	constructor(a) {
		super(a);
		this._value = a;
	}
	//cast(other) {
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
	//}
	toString() {
		return this._value.toString();
	}
	valueOf() {
		return this._value.valueOf();
	}
}

class Integer extends Decimal {
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
	eq(other) {
		return this.valueOf() === other.valueOf();
	},
	gt(other) {
		return this.valueOf() > other.valueOf();
	},
	lt(other) {
		return this.valueOf() < other.valueOf();
	},
	gte(other) {
		return this.valueOf() >= other.valueOf();
	},
	lte(other) {
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
	div(other) {
		return this / other;
	}
};

// mixin comparators
Object.assign(String.prototype, compProto);

Object.assign(Float.prototype, compProto, opProto);

Object.assign(Number.prototype, compProto, opProto);

Object.assign(Boolean.prototype, compProto);

// TODO decimal opt-in/out
const zeroInt = () => new Decimal(0);
const zero = () => Number(0);
const emptyString = () => String();
const emptyUntypedAtomic = () => new UntypedAtomic("");

// TODO create from Type classes
export function decimal($a) {
	// type test
	return seq($a).map(a => cast(a, Decimal, zeroInt));
}

export function integer($a) {
	return seq($a).map(a => cast(Math.floor(a), Integer, zeroInt));
}

export function string($a, card = zeroOrOne) {
	// type test
	const cc = String;
	if(isUndef($a)) return seq(cc);
	//if(empty($a)) return seq(emptyString());
	// NOTE allow overriding cardinality
	return card($a).concatMap(a => isVNode(a) ? data(a, cc, emptyString) : cast(a, cc, emptyString));
}

export function number($a) {
	// type test
	const cc = Number;
	if(isUndef($a)) return seq(cc);
	return zeroOrOne($a).map(a => cast(a, cc, zero));
}

export function float($a) {
	// type test
	const cc = Number;
	if(isUndef($a)) return seq(cc);
	return zeroOrOne($a).map(a => cast(a, cc, zero));
}

export const double = number;

const hasZeroOrOne = $a => $a.skip(1).isEmpty();

export function boolean($a) {
	// type test
	$a = seq($a);
	return empty($a).concatMap(test => test ?
		seq(false) :
		hasZeroOrOne($a).concatMap(test => test ?
			$a.map(a => a.valueOf()) :
			$a.concatMap((a,i) => isVNode(a) ? true : error("err:FORG0006",`Item ${i+1} is not a node`))
		)
	);
}

export function cast($a, $b, emptyType = null) {
	$a = seq($a);
	$b = exactlyOne($b);
	return empty($a).concatMap(test => test ? emptyType ? seq(emptyType()) : seq() : op($a,_cast, $b));
}

function _cast(a, b, emptyType = null) {
	if(isUndefOrNull(a) && emptyType) return emptyType();
	if (a.constructor !== b) a = new b(a.toString());
	return a;
}

export function to($a, $b) {
	return range($b, $a);
}

export function indexOf($a, $b) {
	return zeroOrOne($b).concatMap(b => $a.map((x,i) => b === x ? i + 1 : 0).filter(x => x));
}

export function call(...a) {
	seq(a[0]).concatMap(f => {
		if (isArray(f)) {
			return aGet(f,a[1]);
		} else if (isMap(f)) {
			return mGet(f,a[1]);
		} else {
			return f.apply(this, a.slice(1));
		}
	});
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
			if (!numbertest(a)) return error("err:XPTY0004", a.constructor.name + "(" + a + ") can not be operand for " + op);
			if (!numbertest(b)) return error("err:XPTY0004", b.constructor.name + "(" + b + ") can not be operand for " + op);
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
			return error("XPST0017","Operator " + op + " not implemented for " + a + " (" + (a.constructor.name) + ")");
		}
	}
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
		if (c == Integer || c == Decimal || c == Float || c == UntypedAtomic) {
			a = +a.toString();
			c = Number;
		}
		if (d == Integer || d == Decimal || d == Float || d == UntypedAtomic) {
			b = +b.toString();
			d = Number;
		}
	}
	if (c == Integer || d == Integer) {
		if (c == Decimal || c == UntypedAtomic) {
			a = c == UntypedAtomic ? new Integer(a.toString()) : a;
			c = Integer;
		}
		if (d == Decimal || d == UntypedAtomic) {
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
		return error("err:XPTY0004", "Cannot compare operands: " + c.name + " and " + d.name);
	}
	return [a, b];
}

function _opReducer($a, opfn, $b, general) {
	if (general) {
		return $a.concatMap(a => $b.reduce((acc, b) => acc || opfn(a, b), false)).first(x => x, () => true, false);
	} else {
		return $a.concatMap(a => $b.reduce((a, b) => opfn(a, b), a));
	}
}

export function and($a, $b) {
	$a = boolean($a);
	$b = boolean($b);
	return _opReducer($a, (a,b) => a && b, $b);
}

export function or($a, $b) {
	$a = boolean($a);
	$b = boolean($b);
	return _opReducer($a, (a,b) => a || b, $b);
}

export function not($a) {
	return boolean($a).map(a => !a);
}

const logic = {
	and: and,
	or: or,
	not: not
};

const opinv = {
	ne: true,
	"!=": true
};
export function op($a, operator, $b) {
	var invert = false,
		comp = false,
		general = false,
		hasOp = false,
		operatorName;
	var opfn;
	if (typeof operator == "string") {
		invert = opinv[operator];
		hasOp = operator in operatorMap;
		if(!hasOp){
			general = operator in generalOperatorMap;
			if(!general) return error("xxx", "No such operator");
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
			// FIXME NOT! allow arithmetic on sequences (why not?)...
			// FIXME reduce when comp result is seq of booleans
			$a = zeroOrOne($a);
			$b = zeroOrOne($b);
		}
	} else if (typeof operator == "function") {
		opfn = operator;
	} else {
		return error("XPST0017", "Unknown operator: "+operator);
	}
	return _opReducer($a, opfn, $b, general);
}

export function data($a,castToType = UntypedAtomic,emptyType = emptyUntypedAtomic) {
	return seq($a).concatMap(a => dataImpl(a, castToType, emptyType));
}

function dataImpl(node, castToType, emptyType) {
	if(isEmptyNode(node)) return seq();
	if (!isVNode(node)) return seq(node);
	return vdoc(node).concatMap(node => {
		var type = node.type;
		var $ret;
		if (type == 3) {
			var val = node.value;
			// if string, cast
			if (typeof val == "string" && castToType != String) {
				val = !val ? undefined : _cast(val, castToType, emptyType);
			}
			$ret = seq(val);
		}
		// there was a node, so coerce to emptyType, even if it was empty
		return empty($ret).concatMap(function (isEmpty) {
			return isEmpty ? seq(emptyType()) : $ret;
		});
	});
}

export function instanceOf($a, $b, $card = null) {
	if(!$card) $card = seq(x => seq(x));
	return exactlyOne($card).concatMap(card => exactlyOne($b).concatMap(b => card($a).reduce((c,a) => c && a.constructor === b,true)));
}

export function minus($a) {
	var a = first($a);
	if (typeof a.neg == "function") return a.neg();
	return -a;
}

export function round($a) {
	let a = first($a);
	if(!a) return integer(0);
	return integer(typeof a.round == "function" ? a.round() : Math.round(a));
}

export function floor($a) {
	let a = first($a);
	if (!a) return integer(0);
	return integer(typeof a.floor == "function" ? a.floor() : Math.floor(a));
}
