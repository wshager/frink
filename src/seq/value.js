import { isSeq } from "../seq";

import { isNull } from "../util";

import { pipe, map, filter } from "rxjs/operators";

import { eq } from "../op";

export function indexOf($a, b) {
	if(isNull($a)) return $a;
	if(!isSeq($a)) return eq($a,b) ? 1 : null;
	return pipe(map((a,idx) => [a,idx]),filter(a => eq(a,b)),map(([,idx]) => idx + 1))($a);
}
