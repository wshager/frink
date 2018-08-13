import { isSeq, switchMap, isZeroOrOne, skip } from "../seq";

import { isNull } from "../util";

import { isVNode } from "l3n";

import { error } from "../error";

import * as impl from "../impl";

export function boolean($a) {
	// type test
	return !isSeq($a) ? isNull($a) ? false : !!$a.valueOf() :
		switchMap(isZeroOrOne($a), t => t ?
			switchMap($a, a => isVNode(a) ? true : !!a.valueOf()) :
			switchMap(skip(1)($a), a => isVNode(a) ? true : error("err:FORG0006","Second item is not a node"))
		);
}

export function not($a) {
	return switchMap(boolean($a),impl.not);
}
