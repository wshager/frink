import XRegExp from "xregexp";

import { seq, isSeq, first } from "./seq";

import { string } from "./type";

import { e, a, x, q } from "./vnode";

import { isNode } from "./access";

import { into, transform, compose, forEach, filter, foldLeft, cat } from "./transducers";


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
	var str = first(string($str));
    var ret = [];
	var index = 0;
	if(str){
		let pat = first($pat);
		XRegExp.replace(str.toString(),_cached(pat),function(... args){
			var match = args.shift();
			var str = args.pop();
			var idx = args.pop();
			// the rest is groups
			if(idx > index) ret.push(
				e("fn:non-match",x(str.substring(index,idx)))
			);
			index = idx + match.length;
			var len = args.length;
			if(len > 0) {
				var children = [];
				for(let i = 0;i<len;i++){
					let _ = args[i];
					if (_ !== undefined) {
						// nest optional groups that are empty
						// TODO nested groups
						if(_ !== "") {
							children.push(element("fn:group",seq(attribute("nr",Number(i+1)),text(_))));
						} else {
							var clen = children.length;
							var last = clen ? children[clen-1] : children;
							last.push(element("fn:group",seq(attribute("nr",Number(i+1)))));
						}
					}
				}
				var elm = e("fn:match",children);
				ret.push(elm);
			} else if(match) {
				ret.push(e(seq("fn:match"),x(match)));
			}
		});
		if(index < str.length) ret.push(e("fn:non-match",x(str.substr(index))));
	}
	return e("fn:analyze-string-result",ret);
}

export function tokenize($str,$pat) {
	var str = first(string($str));
	if(!str) return seq();
	let pat = first($pat);
    return into(str.toString().split(_cached(pat)),forEach(s => string(s)), seq());
}

export function substring($str,$s,$l) {
	var str = first(string($str)),
		s = Math.round(first($s)) - 1;
	if(!$l) return _.substring(s);
	var l = first($l);
	return string(str.substring(s,s + Math.round(l)));
}

export function stringToCodepoints($str){
	var str = first(string($str));
	var ret = [];
	for(var i=0,l=str.length;i<l;i++){
		ret[i] = str.codePointAt(i);
	}
	return seq(ret);
}

export function codepointsToString($seq){
	return string(foldLeft($seq,(acc,_) => acc + String.fromCodePoint(_),""));
	//return seq($seq.map(_ => String.fromCodePoint(_)).join(""));
}

export function upperCase($str) {
	return string(first(string($str)).toUpperCase());
}

export function lowerCase($str) {
	return string(first(string($str)).toLowerCase());
}

export function normalizeSpace($str) {
	return string(first(string($str)).replace(/^[\x20\x9\xD\xA]+|[\x20\x9\xD\xA]+$/g,"").replace(/[\x20\x9\xD\xA]+/g," "));
}

export function matches($str,$pat) {
    var str = first(string($str));
	var pat = first($pat);
	if(pat === undefined) return error("xxx");
    str = _isNode(str) ? str.data() : str;
	if(str === undefined) return seq(false);
    return _cached(pat).test(str.toString());
}

export function replace($str,$pat,$rep) {
	var str = first(string($str)),
    	pat = first($pat),
    	rep = first($rep);
	if(pat === undefined || rep === undefined) return error("xxx");
	if(str === undefined) return seq();
    return string(XRegExp.replace(str.toString(),_cached(pat),_repcached(rep),"all"));
}


const regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

export function stringLength($str) {
	let str = first(string($str));
	if(str === undefined) return seq();
	return str.replace(regexAstralSymbols,"_").toString().length;
}

export function stringJoin($seq,$sep) {
	let sep = first($sep);
	return string(into($seq,forEach(s => string(s)),[]).join(sep !== undefined ? sep : ""));
}

export function concat(... a){
    return string(transform(a,compose(forEach(s => string(s)),cat)).join(""));
}

export function normalizeUnicode($str,$form) {
	var str = first(string($str));
	var form = first($form);
	return !str ? seq() : string(!form ? str.normalize() : str.normalize(form.toUpperCase()));
}
