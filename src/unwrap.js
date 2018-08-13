import { isSeq, create } from "./seq";

// what's this?
// we want to call a function with a Single or Maybe with a value or null instead of an Observable
// so we use the type signature to derive the cardinality of each argument
// if the argument is Single, we just unwrap it,
// if the argument is Maybe, we unwrap it and convert an Nothing to null
// if the argument is Flowable, we just pass the Observable

// TODO move to VM
// Rx way is create an Observable from array, wrap everything that's not an Observable and mergeAll
// if we don't know the number of args in advance we have the same problem...
// so we just create a function for each arity...
// note that empty seq will not map, so this can be used for any Maybe
// and if at the end we get an Observable back, can just subscribe to that
const _unwrap = ($o, f,args,len,idx) => {
	if(idx === len) {
		const ret = f(...args);
		if(isSeq(ret)) {
			ret.subscribe($o);
		} else {
			$o.next(ret);
			$o.complete();
		}
	} else {
		const $a = args[idx];
		if(isSeq($a)) {
			let empty = true;
			$a.subscribe({
				next(a) {
					args[idx] = a;
					empty = false;
					_unwrap($o, f,args,len,idx+1);
				},
				complete() {
					if(!empty) $o.complete();
				},
				error(err) {
					$o.error(err);
				}
			});
		} else {
			args[idx] = $a;
			_unwrap($o, f,args,len,idx+1);
		}
	}
};

// returns a single value or observable from a function call (reduce over args)
// we don't want to subscribe at the end of all computation, but after each value, if there is one
// unless the value is a seq
export const unwrap = (f,typesig,...args) => create($o => {
	_unwrap($o, f, args, args.length, 0);
});
