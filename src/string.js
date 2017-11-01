import XRegExp from "xregexp";

import { seq, zeroOrOne, exactlyOne } from "./seq";

import { string } from "./type";

import { e, a, x } from "./construct";

import { appendChild } from "./modify";

//import { isVNode } from "./access";

import { isUndef, ucs2length } from "./util";

const _regexpCache = {};

function _cached(pat){
	pat = pat.toString();
	if(pat in _regexpCache) return _regexpCache[pat];
	var regex = XRegExp(pat,"g");
	_regexpCache[pat] = regex;
	return regex;
}

const _replaceCache = {};

// FIXME move to transpiler!
function _repcached(rep){
	rep = rep.toString();
	if(rep in _replaceCache) return _replaceCache[rep];
	var normal = rep.replace(/(^|[^\\])\\\$/g,"$$$$").replace(/\\\\\$/g,"\\$$");
	_replaceCache[rep] = normal;
	return normal;
}

export function analyzeString($str,$pat) {
	return string($str).concatMap(str => {
		var $ret = e("fn:analyze-string-result");
		var index = 0;
		if(!str) return $ret;
		return exactlyOne($pat).concatMap(pat => {
			XRegExp.replace(str.toString(),_cached(pat),function(... args){
				var match = args.shift();
				var str = args.pop();
				var idx = args.pop();
				// the rest is groups
				if(idx > index) $ret = appendChild($ret,e("fn:non-match",x(str.substring(index,idx))));
				index = idx + match.length;
				var len = args.length;
				var $me = e("fn:match");
				if(len > 0) {
					var children = [];
					for(let i = 0;i<len;i++){
						let _ = args[i];
						if (_ !== undefined) {
							// nest optional groups that are empty
							// TODO nested groups
							if(_ !== "") {
								children[i] = e("fn:group",seq(a("nr",Number(i+1)),x(_)));
							} else {
								var clen = children.length;
								if(clen) {
									var $last = children[clen - 1];
									children[clen - 1] = appendChild($last,e("fn:group",seq(a("nr",Number(i+1)))));
								}
							}
						}
						if(children[i]) $me = appendChild($me,children[i]);
					}
					if(children.length) $ret = appendChild($ret,$me);
				} else if(match) {
					$me = appendChild($me,x(match));
					$ret = appendChild($ret,$me);
				}
			});
			if(index < str.length) $ret = appendChild($ret,e("fn:non-match",x(str.substr(index))));
			return $ret;
		});
	});
}

export function tokenize($str,$pat) {
	return string($str)
		.concatMap(str => exactlyOne($pat)
			.concatMap(pat => seq(str.toString().split(_cached(pat))).concatMap(s => string(s))));
}

export function substring($str,$s,$l) {
	return string(zeroOrOne($str)
		//.concatMap(str => string(str))
		.concatMap(str => exactlyOne($s).concatMap(s => {
			s = Math.round(s) - 1;
			return isUndef($l) ? seq(str.substr(s)) : exactlyOne($l).map(l => str.substr(s,Math.round(l)));
		})));
}

export function stringToCodepoints($str){
	return zeroOrOne($str).concatMap(str => {
		// TODO integer opt-in
		var ret = [];
		for(var i=0,l=str.length;i<l;i++){
			ret[i] = str.codePointAt(i);
		}
		return ret;
	});
}

export function codepointsToString($seq){
	return stringJoin(seq($seq).map(_ => String.fromCodePoint(_.valueOf())));
}

export function upperCase($str) {
	return string(zeroOrOne($str).map(str => str.toUpperCase()));
}

export function lowerCase($str) {
	return string(zeroOrOne($str).map(str => str.toLowerCase()));
}

export function normalizeSpace($str) {
	return string(zeroOrOne($str).map(str => str.replace(/^[\x20\x9\xD\xA]+|[\x20\x9\xD\xA]+$/g,"").replace(/[\x20\x9\xD\xA]+/g," ")));
}

export function matches($str,$pat) {
	return zeroOrOne($str).concatMap(str => exactlyOne($pat).map(pat => _cached(pat).test(str.valueOf())));
}

export function replace($str,$pat,$rep) {
	return string(zeroOrOne($str)
		.concatMap(str => exactlyOne($pat)
			.concatMap(pat => exactlyOne($rep)
				.map(rep => XRegExp.replace(str.valueOf(),_cached(pat),_repcached(rep),"all")))));
}

export function stringLength($str) {
	$str = zeroOrOne($str);
	return $str.isEmpty().concatMap(test => test ? seq(0) : $str.map(str => ucs2length(str)));
}

export function stringJoin($seq,$sep) {
	// frink implementation allows passing a different cardinality test to string...
	return string(string($seq,seq).reduce((acc = [],_) => {
		acc.push(_);
		return acc;
	},undefined).concatMap(a => isUndef($sep) ? seq(a.join("")) : seq($sep).map(sep => a.join(sep))));
}

export function concat(... args){
	return stringJoin(seq(args).concatMap(a => string(a)));
}

export function normalizeUnicode($str,$form) {
	return string(zeroOrOne($str).concatMap(str => isUndef($form) ? seq(str.normalize()) : seq($form).map(form => str.normalize(form.toUpperCase()))));
}
