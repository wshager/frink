import {
    string, number, boolean, integer, double, float, decimal, data
} from "./type";

import { seq, isSeq, first } from "./seq";

import { isNode } from "./access";

import { forEach, filter } from "./transducers";

import { error } from "./error";

import { glt, ggt } from "./op";

const modules = {
    "http://www.w3.org/2005/xpath-functions":exports
};

export function module(location) {
    // conflict?
    //if (module.uri in modules) return;
    var module = require(location);
    modules[module.$uri] = module;
    return module;
}

function camelCase(str) {
    return str.split(/-/g).map((_,i) => i > 0 ? _.charAt(0).toUpperCase() + _.substr(1) : _).join("");
}

export function functionLookup($name,$arity){
    var qname = first($name);
    var arity = first($arity);
    var uri = first(qname.uri).toString();
    var name = camelCase(first(qname.name).toString().split(/:/).pop());
    var fn = modules[uri][name+"$"+arity];
    if(!fn) fn = modules[uri][name+"$"];
    return !!fn ? fn : seq();
}

export function apply($fn,$a) {
	var a = first($a);
	if(!(a instanceof Array)){
		if(typeof a.toJS != "function") return error("");
	}
	return first($fn).apply(this,a.toJS(true));
}

// FIXME check if seq + apply data
export function sort(...args){
    var l = args.length;
	var s = args[0];
	if(!isSeq(s)) return s;
	var crit = l>1 ? first(a[1]) : function(a,b){
        var gt = ggt(a,b);
        var lt = glt(a,b);
		return gt ? 1 : lt ? -1 : 0;
	};
	return seq(s.toArray().sort(crit));
}

export { error };
