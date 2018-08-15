export const and = (a,b) => a && b;

export const or = (a,b) => a || b;

export const not = a => !a;

export function nodeData(node) {
	const type = node.type;
	// type 2 will only appear in traversal when node is an attr
	if (type == 2 || type == 3) {
		return node.value;
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
