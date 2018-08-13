import Decimal from "big.js";

import UntypedAtomic from "./untyped-atomic";

import { error } from "./error";

import { seq, isSeq, exists, forEach, filter, empty, range, zeroOrOne, exactlyOne, unwrap } from "./seq";

import { isArray, get as aGet } from "./array";

import { isMap, get as mGet } from "./map";

import { isUndef } from "./util";

import { isVNode, traverse } from "l3n";

import { boolean, not } from "./boolean/value";

import * as impl from "./impl";

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

// TODO create from Type classes
export function decimal($a) {
	// type test
	return seq($a).concatMap(a => cast(a, Decimal, zeroInt));
}

export function integer($a) {
	return seq($a).concatMap(a => cast(Math.floor(a), Integer, zeroInt));
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
	return zeroOrOne($a).concatMap(a => cast(a, cc, zero));
}

export function float($a) {
	// type test
	const cc = Number;
	if(isUndef($a)) return seq(cc);
	return zeroOrOne($a).concatMap(a => cast(a, cc, zero));
}

export const double = number;

export function cast($a, $b, emptyType = null) {
	$a = seq($a);
	$b = exactlyOne($b);
	return empty($a).concatMap(test => test ? emptyType ? seq(emptyType()) : seq() : unwrap(impl.cast,$a,$b));
}


export function to($a, $b) {
	return range($b, $a);
}

export function indexOf($a, $b) {
	return unwrap(b => filter(forEach($a,(x,i) => b === x ? i + 1 : 0),x => x),$b);
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

// TODO move to VM
/*
function numbertest(a) {
	var c = a.constructor;
	if (c == String || c == Boolean) return;
	return true;
}
*/
function _op(op, invert, a, b) {
	var ret;
	if (a === undefined || b === undefined) {
		return error("A value may never be undefined");
	}
	if (typeof a[op] == "function") {
		[a,b] = _promote(a, b);
		ret = a[op](b);
	} else {
		return error("XPST0017","Operator " + op + " not implemented");
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
	//if (c != d) {
	//throw new Error("Cannot compare operands: " + c.name + " and " + d.name);
	//	return error("err:XPTY0004", "Cannot compare operands: " + c.name + " and " + d.name);
	//}
	return [a, b];
}

function _unwrapGeneral(opfn, $a, $b) {
	const aIsSeq = isSeq($a);
	const bIsSeq = isSeq($b);
	//console.trace($a,$b);
	if(!aIsSeq && !bIsSeq) {
		return opfn($a,$b);
	}
	return exists(filter($a,a => filter($b, b => opfn(a,b))));
}


/**
 *
 */
export function and($a, $b) {
	return unwrap(impl.and, boolean($a), boolean($b));
}

export function or($a, $b) {
	return unwrap(impl.or, boolean($a), boolean($b));
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
			opfn = _op.bind(null, operatorName, invert);
		}
		if (comp) {
			$a = data($a);
			$b = data($b);
		}
		// NOTE cardinality tests should be taken care of by VM
	} else if (typeof operator == "function") {
		opfn = operator;
	} else {
		return error("XPST0017", "Unknown operator: "+operator);
	}
	if(general) return _unwrapGeneral(opfn, $a, $b);
	return unwrap(opfn, $a, $b);
}

function data($a) {
	return forEach($a, a => {
		if(isVNode(a)) {
			return traverse(a).pipe(filter(node => node.type == 2 || node.type == 3),forEach(node => impl.nodeData(node)));
		} else {
			return a;
		}
	});
}
