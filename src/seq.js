import { Observable } from "rxjs/Observable";
import { error } from "./error";
import { isObject, isUndef, isUndefOrNull, isUntypedAtomic } from "./util";
import { isVNode } from "./access";

import "rxjs/add/observable/of";
import "rxjs/add/observable/from";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/range";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/throw";

import "rxjs/add/operator/isEmpty";
import "rxjs/add/operator/take";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/first";
import "rxjs/add/operator/reduce";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/buffer";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/concatMap";
import "rxjs/add/operator/concatAll";
import "rxjs/add/operator/switch";
import "rxjs/add/operator/switchMap";

import { concatMap, filter as rxFilter} from "rxjs/operators";

export const forEach = concatMap;
export const filter = rxFilter;
const _wrap = fn => (acc,v) => {
	return seq(fn(acc,v));
};
export const foldLeft = (...args) => {
	const len = args.length;
	const $s = seq(args[0]).map(s => seq(s));
	const $fn = exactlyOne(len == 2 ?  args[1] : args[2]);
	const $seed = len == 2 ? seq() : seq($seed);
	const _reducer = $seed => $fn.concatMap(fn => seq($s.reduce(_wrap(fn),$seed))).concatAll();
	return len == 2 ? _reducer(undefined) : _reducer($seed);
};

export { pipe as compose } from "rxjs/util/pipe";

export { take, skip } from "rxjs/operators";

/*function _asyncIteratorToObservable(asyncIter) {
	const forEach = (ai, fn, cb) => {
		return ai.next().then(function (r) {
			if (!r.done) {
				try {
					fn(r.value);
				} catch(err) {
					cb(err);
				}
				return forEach(ai, fn, cb);
			} else {
				cb();
			}
		}, cb);
	};
	return new Observable(sink => {
		forEach(asyncIter,x => sink.next(x), err => {
			if(err) return sink.error(err);
			sink.complete();
		});
	});
}*/
/*
LazySeq.prototype.toString = function(){
	return "Seq [" + this.iterable + "]";
};
*/
// resolve an observable like a promise
export function when(s,rs,rj){
	return s.buffer().subscribe({
		next:buf => {
			rs(buf);
		},
		error: err => {
			rj(err);
		}
	});
}

export function isSeq(a){
	return !!(a && a instanceof Observable);
}

export function seq(...a){
	if (a.length == 0) return Observable.empty();
	if (a.length == 1){
		var x = a[0];
		if(isSeq(x)) return x;
		if(isUndefOrNull(x)) return Observable.empty();
		if(isObject(x) && (x instanceof Promise || typeof x.then == "function")) return Observable.fromPromise(x);
		if(Array.isArray(x) || (x[Symbol.iterator] && typeof x != "string" && !isUntypedAtomic(x) && !isVNode(x))) return Observable.from(x);
		return Observable.of(x);
	}
	return Observable.from(a).map(a => seq(a)).concatAll();
}

export function create(o){
	return Observable.create(o);
}

export const first = s => {
	return seq(s).first();
};

export function empty(s){
	return seq(s).isEmpty();
}

export function exists(s){
	return !empty(s);
}

export function count(s){
	return seq(s).count();
}

export function insertBefore(s,pos,ins) {
	s = seq(s);
	pos = pos - 1;
	return s.take(pos).merge(seq(ins),s.skip(pos));
}

export function range($n,$s=0) {
	$n = zeroOrOne($n);
	$s = zeroOrOne($s);
	return $s.concatMap(s => $n.concatMap(n => Observable.range(s,n)));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
export function zeroOrOne($arg) {
	var s = seq($arg);
	return s.isEmpty().merge(s.skip(1).isEmpty()).reduce((a,x) => a || x).switchMap(isEmptyOrOne => isEmptyOrOne ? s : error("FORG0003"));
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function oneOrMore($arg) {
	var s = seq($arg);
	return s.isEmpty().switchMap(isEmpty => isEmpty ? error("FORG0004") : s);
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function exactlyOne($arg) {
	var s = seq($arg);
	return s.isEmpty().merge(s.skip(1).isEmpty().map(x => !x)).reduce((a,x) => a || x).switchMap(isEmptyOrMore => isEmptyOrMore ? error("FORG0005") : s);
}
