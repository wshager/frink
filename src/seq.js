import { Observable } from "rxjs/Observable";
import { error } from "./error";
import { isObject, isDOMNode, isUndef, isUndefOrNull, isUntypedAtomic, isList, isMap } from "./util";
import { isVNode } from "./access";

import "rxjs/add/observable/of";
import "rxjs/add/observable/from";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/range";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/throw";

import "rxjs/add/operator/toArray";
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
import "rxjs/add/operator/zip";

import { concatMap, filter as rxFilter} from "rxjs/operators";

import { pipe } from "rxjs/util/pipe";

export const fromArgs = args => seq(args.map(x => seq(x))).concatAll();

export function compose(...args){
	return fromArgs(args).toArray().map(a => pipe.apply(a,a));
}

export const forEach = ($s,$fn) => {
	if(!isUndef($fn)) return seq($fn).concatMap(fn => seq($s).concatMap(x => seq(fn(x))));
	return seq($s).map(fn => concatMap(x => seq(fn(x))));
};
export const filter = rxFilter;
const _wrap = fn => (...args) => {
	return seq(fn.apply(null,args.map(x => seq(x))));
};

export const foldLeft = (...args) => {
	const len = args.length;
	const $s = seq(args[0]);
	const $seed = len == 2 ? undefined : seq(args[1]);
	const $fn = exactlyOne(len == 2 ? args[1] : args[2]);
	return $fn.concatMap(fn => seq($s.reduce(_wrap(fn),$seed))).concatAll();
};

export const from = a => Observable.from(a);

export const of = a => Observable.of(a);

export const fromPromise = a => Observable.fromPromise(a);

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
		if(isObject(x) && (x instanceof Promise || typeof x.then == "function")) return fromPromise(x);
		if(Array.isArray(x) || (x[Symbol.iterator] && typeof x != "string" && !isDOMNode(x) && !isUntypedAtomic(x) && !isVNode(x) && !isList(x) && !isMap(x))) return from(x);
		return of(x);
	}
	return from(a).map(a => seq(a)).concatAll();
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

export const isZeroOrOne = s => s.isEmpty().merge(s.skip(1).isEmpty()).reduce((a,x) => a || x);

export const isOneOrMore = s => s.isEmpty().map(x => !x);

export const isExactlyOne = s => s.isEmpty().merge(s.skip(1).isEmpty().map(x => !x)).reduce((a,x) => a || x).map(x => !x);

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
export function zeroOrOne($arg) {
	var s = seq($arg);
	return isZeroOrOne(s).switchMap(test => test ? s : error("FORG0003"));
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function oneOrMore($arg) {
	var s = seq($arg);
	return isOneOrMore(s).switchMap(test => test ? s : error("FORG0004"));
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function exactlyOne($arg) {
	var s = seq($arg);
	return isExactlyOne(s).switchMap(test => test ? s : error("FORG0005"));
}

export function transform($arg, $fn) {
	var s = seq($arg);
	return seq($fn).concatMap(fn =>
		isExactlyOne(s)
			.switchMap(test => test ?
				s.concatMap(x => x[Symbol.iterator] ?
					from(x)
						.pipe(fn)
						.reduce((a,x) => a["@@transducer/step"](a,x),x["@@transducer/init"]())
						.map(x => x["@@transducer/result"](x)) :
					s.pipe(fn)) :
				s.pipe(fn)
			));
}
