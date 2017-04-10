import { seq, isSeq, first } from "./seq";

import { transform, filter, compose, drop, take } from "./transducers";

export function subsequence($a,$i,$l){
	let i = first($i), l = first($l);
	i = i.valueOf() - 1;
	var d = i < 0 ? i : 0;
	var f = l === undefined ? drop(i) : compose(drop(i),take(l.valueOf() - d));
	return transform($a,f);
}

export function head($a){
	return take($a,1);
}

export function tail($a){
	return drop($a,1);
}

export function remove($a,$i){
	let i = first($i);
	i = i.valueOf() - 1;
	return filter($a,(_,j) => j != i);
}

export function reverse($a) {
	return seq($a.toArray().reverse());
}
