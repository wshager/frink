import { seq, isSeq, die, first, empty, filter, compose, skip, take } from "./seq";
import { error } from "./error";
import { isUndef } from "./util";

export function subsequence($a,$i,$l=0){
	$a = seq($a);
	if(isUndef($i)) return error("XPST0017");
	return seq($i).concatMap(i => seq($l).concatMap(l => {
		i = i - 1;
		var d = i < 0 ? i : 0;
		return l === 0 ? $a.skip(i) : $a.pipe(skip(i),take(l - d));
	}));
}

export function head($a){
	return seq($a).take(1);
}

export function tail($a){
	return seq($a).skip(1);
}

export function remove($a,$i){
	if(isUndef($i)) return error("XPST0017");
	return seq($i).concatMap(i => $a.take(i < 1 ? 0 : i - 1).merge($a.skip(i)));
}

export function reverse($a) {
	return seq($a).reduce((arr=[],x) => {
		arr.push(x);
		return arr;
	},undefined).concatMap(x => x.reverse());
}
