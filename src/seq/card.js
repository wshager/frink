import { isSeq, isMaybe, isSingle, switchMap } from "../seq";

import { error } from "../error";

import { not } from "../impl";

import { pipe } from "rxjs";

import {
	map,
	skip,
	zip,
	isEmpty
} from "rxjs/operators";

import { isNull } from "../util";

export const isZeroOrOne = s => isMaybe(s) || !isSeq(s) || pipe(skip(1),isEmpty())(s);

export const isOneOrMore = s => (!isSeq(s) && !isNull(s)) || pipe(isEmpty(),map(not))(s);

export const isExactlyOne = s => isSingle(s) || (!isSeq(s) && !isNull(s)) || pipe(isEmpty(),zip(pipe(skip(1),isEmpty())(s),(x, y) => !x && y))(s);


function _testCard($arg,card,err) {
	return switchMap(t => t ? $arg : error(err))(card($arg));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error} [Process Error in implementation]
 */
export function zeroOrOne($arg) {
	return _testCard($arg,isZeroOrOne,"FORG0003");
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function oneOrMore($arg) {
	return _testCard($arg,isOneOrMore,"FORG0004");
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function exactlyOne($arg) {
	return _testCard($arg,isExactlyOne,"FORG0005");
}
