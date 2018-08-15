import { seq, isSeq } from "../seq";

import { isNull, isUndef } from "../util";

import { pipe } from "rxjs";

import { isEmpty, map, take, skip, merge, mergeMap, toArray } from "rxjs/operators";

import { not } from "../impl";

import error from "../error";

export const empty = s => isSeq(s) ? isEmpty()(s) : isNull(s);

export const exists = s => isSeq(s) ? pipe(isEmpty(),map(not))(s) : !isNull(s);

export function head($a){
	return isNull($a) || !isSeq($a) ? $a : take(1)($a);
}

export function tail($a){
	return isNull($a) || !isSeq($a) ? null : skip(1)($a);
}

export function insertBefore($s,pos,$ins) {
	return pipe(take(pos - 1),merge(seq($ins),skip(pos)))(seq($s));
}

export function remove($a,i){
	if(isUndef(i)) return error("XPST0017");
	$a = seq($a);
	return merge(take(i < 1 ? 0 : i - 1)($a),$a.skip(i));
}

export function reverse($a) {
	return !isSeq($a) ? $a : pipe(toArray(),mergeMap(a => a.reverse()))($a);
}

export function subsequence($a,i,l=0){
	if(isUndef(i)) return error("XPST0017");
	$a = seq($a);
	i = i - 1;
	var d = i < 0 ? i : 0;
	return l === 0 ? skip(i)($a) : pipe(skip(i),take(l - d))($a);
}
