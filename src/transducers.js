import { seq, isSeq } from "./seq";
import * as t from "transducers.js";
import { RangeObservable } from "rxjs/observable/RangeObservable";

export function compose() {
	var l = arguments.length;
	var funcs = new Array(l);
	for(var i = 0; i < l; ++i) {
		funcs[i] = arguments[i];
	}
	return function(r) {
		var value = r;
		for(var i = l - 1; i >= 0; i--) {
			value = funcs[i](value);
		}
		return value;
	};
}

export function forEach(iterable, f) {
	if (arguments.length == 1) return t.map(iterable);
	return transform(iterable, t.map(f));
}
/*
export function distinctCat(iterable, f) {
	if (arguments.length < 2) return distinctCat$1(iterable || _contains);
	return _iterate(iterable, distinctCat$1(f), _new(iterable));
}
*/
// non-composable
export function foldLeft(iterable, z, f) {
	return iterable.reduce(f,z);
}

// FIXME always return a collection, iterate by overriding _append to just return the value
export function transform(iterable, f) {
	return isSeq(iterable) ? iterable.transform(f) : t.seq(iterable, f);
}

export function into(iterable, f, z) {
	return t.into(z, f, iterable);
}

export function range(n,s=0) {
	return seq(new RangeObservable(s,n));
}

export { MergeMapOperator } from "rxjs/operator/mergeMap";

export { cat, filter, erase, keep, take, drop, takeWhile, dropWhile, dedupe } from "transducers.js";
