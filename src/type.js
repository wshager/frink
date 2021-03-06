import Decimal from "big.js";

import Integer from "./types/integer";

import Float from "./types/float";

import UntypedAtomic from "./types/untyped-atomic";

import opProto from "./types/op-proto";

import compProto from "./types/comp-proto";

import { stringJoin } from "./string/value";

import { error } from "./error";

import { forEach, filter, range, switchMap, pipe, first } from "./seq";

import { get as aGet } from "./array";

import { get as mGet } from "./map";

import { isUndef, isNull, isList, isMap } from "./util";

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

const unaryOperatorMap = {
	"-": "neg"
};

export const generalOperatorMap = {
	">": "gt",
	"<": "lt",
	">=": "gte",
	"<=": "lte",
	"=": "eq",
	"!=": "eq"
};

// mixin comparators
Object.assign(String.prototype, compProto);

Object.assign(Float.prototype, compProto, opProto);

Object.assign(Number.prototype, compProto, opProto);

Object.assign(Boolean.prototype, compProto);

// TODO decimal opt-in/out

const ap10 = (a,b) => b(a);

const asType = (cc,ifEmpty = null,prep = ap10) => a => isUndef(a) ? cc : isNull(a) ? ifEmpty : prep(a,cc);

// TODO create from Type classes
export const decimal = asType(Decimal);

export const integer = asType(Integer);

export const string = asType(String,"",a => isVNode(a) ? data(a).toString() : a.toString());

export const number = asType(Number,NaN,a => +a);

// 32-bits float
export const float = asType(Float,NaN);

export const double = number;

export function castAs(a, b) {
	return b(a);
}

export function to(a, b) {
	return range(b, a);
}

export function call(f,...a) {
	if (isList(f)) {
		return aGet(f,a[0]);
	} else if (isMap(f)) {
		return mGet(f,a[0]);
	} else {
		return f(...a);
	}
}

function _binOp(op, invert, a, b) {
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


function _unaOp(op, invert, a) {
	var ret;
	if (a === undefined) {
		return error("A value may never be undefined");
	}
	if (typeof a[op] == "function") {
		ret = a[op]();
	} else {
		return error("XPST0017","Operator " + op + " not implemented");
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
	return [a, b];
}

function generalComp(opfn, $a, $b) {
	return pipe(switchMap(a => forEach(b => opfn(a,b))($b)),first(x => x,false))($a);
}


/**
 * expect functions
 */
export function and($a, $b) {
	return switchMap(boolean($a()), a => a ? switchMap(boolean($b()),impl.and(a)) : false);
}

export function or($a, $b) {
	return switchMap(boolean($a()), a => a ? true : switchMap(boolean($b()),impl.or(a)));
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

// NOTE cardinality tests should be taken care of by VM
export function op($a, operator, $b) {
	var invert = false,
		comp = false,
		general = false,
		operatorName;
	var opfn;
	if (typeof operator == "string") {
		invert = opinv[operator];
		const hasUnaOp = isUndef($b) && unaryOperatorMap.hasOwnProperty(operator);
		const hasOp = hasUnaOp || operatorMap.hasOwnProperty(operator);
		if(!hasOp){
			general = operator in generalOperatorMap;
			if(!general) return error("xxx", "No such operator");
			operatorName = generalOperatorMap[operator];
		} else {
			operatorName = hasUnaOp ? unaryOperatorMap[operator] : operatorMap[operator];
		}
		if (logic[operatorName]) {
			return logic[operatorName]($a, $b);
		} else if(hasUnaOp) {
			opfn = _unaOp.bind(null, operatorName, invert);
		} else {
			comp = compProto.hasOwnProperty(operatorName);
			opfn = _binOp.bind(null, operatorName, invert);
		}
		if (comp) {
			const md = forEach(data);
			$a = md($a);
			$b = md($b);
		}
	} else if (typeof operator == "function") {
		opfn = operator;
	} else {
		return error("XPST0017", "Unknown operator: "+operator);
	}
	if(general) return generalComp(opfn, $a, $b);
	if(isNull($a) || isNull($b)) return null;
	return opfn($a, $b);
}

export function data($a) {
	return switchMap($a, a => {
		if(isVNode(a)) {
			return new UntypedAtomic(stringJoin(pipe(filter(node => node.type == 2 || node.type == 3),forEach(node => impl.nodeData(node)))(traverse(a))));
		} else {
			return a;
		}
	});
}

/*
 * Pojo L3 constructors
 */
const has = (obj,prop) => obj.hasOwnProperty(prop);
export const m = (...a) => a.reduce((o,{$key,$value}) => {
	o[$key] = $value;
	return o;
},{});
export const l = (...a) => a;
export const e = (qname,...a) => {
	// check if first arg is attrMap
	const len = a.length;
	const node = {};
	node.$name = qname;
	node.$children = [];
	for(let i = 0; i < len; i++) {
		let c = a[i];
		if(typeof c == "function") c = c();
		if(has(c,"$key")) {
			node[c.$key] = c.$value;
		} else {
			node.$children.push(c);
		}
	}
	return node;
};
export const a = (key,val) => ({$key:key,$value:val});
