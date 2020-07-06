import { pipe, ReplaySubject, isObservable, empty, of, from, Observable, Scheduler } from "https://dev.jspm.io/rxjs@6/_esm2015";
import { first, mergeMap, subscribeOn } from "https://dev.jspm.io/rxjs@6/_esm2015/operators";
import { isUndef, isUndefOrNull } from "./common.js";
function isPromise(x) {
    return !!x && x instanceof Promise;
}
const wrap = fn => x => {
    const ret = fn(x);
    return isSeq(ret) || isPromise(ret) ? ret : subscribeOn(Scheduler.queue)(of(ret).toSingle());
};

const forEachCurried = fn => $s => isSeq($s) ? mergeMap(wrap(fn))($s) : fn($s);

export function forEach($s, fn) {
    return !isUndef(fn) ? forEachCurried(fn)($s) : forEachCurried($s);
}
function create(o) {
    return Observable.create(o);
}
class Maybe extends Observable {
    toObservable() {
        return create($o => {
            this.subscribe($o);
        });
    }
}
class Single extends Observable {
    toObservable() {
        return create($o => {
            this.subscribe($o);
        });
    }
}
//const isMaybe = x => !!(x && x instanceof Maybe);
//const isSingle = x => !!(x && x instanceof Single);
Observable.prototype.toSingle = function () {
    return new Single($o => {
        first()(this).subscribe($o);
    });
};

Observable.prototype.toMaybe = function () {
    return new Maybe($o => {
        first()(this).subscribe($o);
    });
};
export const isSeq = isObservable;

function fromType(x) {
    return isSeq(x) ? x : isUndefOrNull(x) ? empty() : of(x).toSingle();
}
export function seq(...a) {
    const len = a.length;
    if (len == 0) return fromType();
    if (len == 1) return fromType(a[0]);
    return mergeMap(x => seq(x))(from(a));
}

export function replayable(val) {
    const s = new ReplaySubject(1);
    if(!isUndef(val)) {
        s.next(val);
    }
    return s;
}

export { pipe, of };