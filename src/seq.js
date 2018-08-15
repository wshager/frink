import { Observable, Scheduler, isObservable, of, from, range as rxRange, empty as rxEmpty, pipe } from "rxjs";
import {
	first as rxFirst,
	subscribeOn,
	map,
	mergeMap,
	concatMap,
	switchMap as rxSwitchMap,
	concatAll,
	reduce,
	filter as rxFilter,
	count as rxCount,
	pairwise
} from "rxjs/operators";

import { isPromise, isUndef, isUndefOrNull, isNull, id } from "./util";
import { boolean } from "./boolean/value";


export class Maybe extends Observable {
	toObservable() {
		return create($o => {
			this.subscribe($o);
		});
	}
}

export class Single extends Observable {
	toObservable() {
		return create($o => {
			this.subscribe($o);
		});
	}
}

export const isMaybe = x => !!(x && x instanceof Maybe);

export const isSingle = x => !!(x && x instanceof Single);

Observable.prototype.toSingle = function() {
	return new Single($o => {
		rxFirst()(this).subscribe($o);
	});
};

Observable.prototype.toMaybe = function() {
	return new Maybe($o => {
		rxFirst()(this).subscribe($o);
	});
};

// TODO check each arg for Observable
export const fromArgs = args => seq(args.map(x => seq(x))).pipe(concatAll());

export const isSeq = isObservable;

const wrap = fn => x => {
	const ret = fn(x);
	return isSeq(ret) || isPromise(ret) ? ret : subscribeOn(Scheduler.queue)(of(ret).toSingle());
};

export const forEachCurried = fn => $s => isSeq($s) ? mergeMap(wrap(fn))($s) : fn($s);

export function forEach($s, fn) {
	return !isUndef(fn) ? forEachCurried(fn)($s) : forEachCurried($s);
}

/**
 * curried filter
 * @param  {function} fn [description]
 * @return {function}     [description]
 */
export const filterCurried = fn => $s =>
	isSeq($s) ?
		pipe(mergeMap(x => pairwise()(seq(boolean(fn(x)),x))),rxFilter(([t]) => t),map(([,x]) => x))($s) :
		pipe(rxFilter(t => t),map(() => $s))(seq(fn($s)));

export function filter($s, fn) {
	return !isUndef(fn) ? filterCurried(fn)($s) : filterCurried($s);
}

export const foldLeftCurried = fn => $seed => $a =>
	isSeq($a) ?
		pipe(reduce((a,x) => fn(a,x),$seed),switchMap(id))($a) :
		fn($seed,$a);

export function foldLeft($a, $seed, fn) {
	return !isUndef(fn) ? foldLeftCurried(fn)($seed)($a) : foldLeftCurried($seed)($a);
}

export const scanCurried = fn => $seed => $a =>
	isSeq($a) ?
		pipe(scan((a,x) => fn(a,x),$seed),switchMap(x => x))($a) :
		fn($seed,$a);

export function scan($a,$seed,fn) {
	return !isUndef(fn) ? scanCurried(fn)($seed)($a) : scanCurried($seed)($a);
}

function fromType(x) {
	return isSeq(x) ? x : isUndefOrNull(x) ? rxEmpty() : of(x).toSingle();
}

export function seq(...a) {
	const len = a.length;
	if (len == 0) return fromType();
	if(len == 1) return fromType(a[0]);
	return concatMap(x => seq(x))(from(a));
}

export function just(a) {
	return (isSeq(a) ? a : of(a)).toSingle();
}

export function create(o){
	return Observable.create(o);
}

// TODO how to use f when not a seq?
export const first = (f,d) => s => isSeq(s) ? rxFirst(f,d)(s) : isNull(s) ? d : s;

export const count = s => isSeq(s) ? rxCount()(s) : 1;

export function range(n,s=0) {
	return subscribeOn(Scheduler.queue)(rxRange(s,n));
}

export const switchMapCurried = fn => $s => isSeq($s) ? pipe(
	rxSwitchMap(wrap(fn)),
	subscribeOn(Scheduler.queue),
	unsubscribeOn(Scheduler.queue))($s) : fn($s);

function unsubscribeOn(scheduler) {
	return source => create(observer => {
		const subscription = source.subscribe(observer);
		return () => scheduler.schedule(() => subscription.unsubscribe());
	});
}

export const switchMap = ($s,fn) => !isUndef(fn) ? switchMapCurried(fn)($s) : switchMapCurried($s);

// FIXME
export function sort($s,fn){
	return switchMap(seq($s).toArray(),a => seq(isUndef(fn) ? a.sort() : a.sort(fn)));
}

export { pipe };
