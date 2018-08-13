import XRegExp from "xregexp";

import { e, a, x } from "l3n";

import { appendChild } from "../modify";

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

export function matches(str,pat) {
	return _cached(pat).test(str.valueOf());
}

export function replace(str,pat,rep) {
	return XRegExp.replace(str.valueOf(),_cached(pat),_repcached(rep),"all");
}

export function tokenize(str,pat) {
	return str.split(_cached(pat));
}

export function analyzeString(str,pat) {
	var ret = e("fn:analyze-string-result");
	var index = 0;
	if(!str) return ret;
	XRegExp.replace(str.toString(),_cached(pat),function(... args){
		var match = args.shift();
		var str = args.pop();
		var idx = args.pop();
		// the rest is groups
		if(idx > index) ret = appendChild(ret,e("fn:non-match",x(str.substring(index,idx))));
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
						children[i] = e("fn:group",a("nr",Number(i+1),x(_)));
					} else {
						var clen = children.length;
						if(clen) {
							var $last = children[clen - 1];
							children[clen - 1] = appendChild($last,e("fn:group",a("nr",Number(i+1))));
						}
					}
				}
				if(children[i]) $me = appendChild($me,children[i]);
			}
			if(children.length) ret = appendChild(ret,$me);
		} else if(match) {
			$me = appendChild($me,x(match));
			ret = appendChild(ret,$me);
		}
	});
	if(index < str.length) ret = appendChild(ret,e("fn:non-match",x(str.substr(index))));
	// TODO finalize for persistent
	return ret;
}
