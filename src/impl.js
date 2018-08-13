import { isUndefOrNull } from "./util";

import UntypedAtomic from "./untyped-atomic";

const emptyUntypedAtomic = () => new UntypedAtomic("");

export const and = (a,b) => a && b;

export const or = (a,b) => a || b;

export const not = a => !a;

export function cast(a, b, emptyType = null) {
	if(isUndefOrNull(a) && emptyType) return emptyType();
	if (a.constructor !== b) a = new b(a.toString());
	return a;
}

export function nodeData(node, castToType = UntypedAtomic, emptyType = emptyUntypedAtomic) {
	var type = node.type;
	// type 2 will only appear in traversal when node is an attr
	if (type == 2 || type == 3) {
		var val = node.value;
		// if string, cast
		if (typeof val == "string" && castToType != String) {
			val = !val ? undefined : cast(val, castToType, emptyType);
		}
		return val;
	}
}

// TODO card = zero-or-more(), but will always return a boolean
// cardinality is taken into account, so the generalized function needs to do that too
export function instanceOf(a, b) {
	return a instanceof b;
}

// TODO card = zero-or-one(), which will return empty() when zero
// better stick to some generally accepted form of Maybe(a) for these cases?
// more TODO generalize mapping of function names to number methods (perhaps with well-known aliases)
export function minus(a) {
	return typeof a.neg == "function" ? a.neg() : -a;
}

/**
 * Round a number
 * @param  {[type]} $a [description]
 * @return {[type]}    [description]
 */
export function round(number,precision) {
	// NOTE 'precision' is actually called 'scale'... bad W3C, bad!
	// TODO get the length of the string representation and use either toPrecision (or toExponential is precision is negative)
	return typeof number.round == "function" ? number.round() : Number.parseFloat(number.toFixed(precision));
}

export function floor(a) {
	return typeof a.floor == "function" ? a.floor() : Math.floor(a);
}
