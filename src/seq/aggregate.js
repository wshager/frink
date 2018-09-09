import { isSeq, foldLeftCurried, switchMap } from "../seq";
import { add, divide, gt, lt } from "../op";
import { count as rxCount, reduce } from "rxjs/operators";

export const count = s => isSeq(s) ? rxCount()(s) : 1;

export const sum = s => foldLeftCurried(add)(0)(s);

export const avg = s => switchMap(sum(s),a => switchMap(count(s), b => divide(a,b)));

export const min = s => reduce((a,x) => lt(x,a) ? x : a)(s);

export const max = s => reduce((a,x) => gt(x,a) ? x : a)(s);
