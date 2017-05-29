import { VNode } from "./vnode";

import { q } from './qname';

import { prettyXML } from "./pretty";

import { forEach, foldLeft, into, range, drop } from "./transducers";

import * as multimap from "./multimap";

// import self!
import * as cx from "./inode";

// helpers ---------------
if(!Object.values){
	const objUtil = (obj,f) => {
		const keys = Object.keys(obj);
		var entries = [];
	    for (let i = 0; i < keys.length; i++) {
	        const key = keys[i];
	        entries.push(f(key));
	    }
		return entries;
	}
	Object.values = function(o){
		return objUtil(o,o[key]);
	};
	Object.entries = function(o){
		return objUtil(o,key => [key, o[key]]);
	};
}
function _inferType(inode){
	if(inode === null) return 12;
	var cc = inode.constructor;
	if(cc == Array) {
		return 6;
	} else if(cc == Object){
		if(inode.$children) {
			return inode.$name == "#document" ? 9 : 1;
		} else {
			return 6;
		}
	} else if(cc == Number || cc == Boolean) {
		return 12;
	}
	return 3;
}

function _get(children,idx){
	let len = children.length;
	for(let i = 0; i<len; i++){
		if((children[i].$name || i + 1) == idx) return children[i];
	}
}

function _last(a){
	return drop(a,a.length-1);
}

function _elemToString(e){
	const attrFunc = (z,kv) => {
		return z += " "+kv[0]+"=\""+kv[1]+"\"";
	};
	let str = "<"+e.$name;
	let ns = e.$ns;
	if(ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = foldLeft(Object.entries(e.$attrs),str,attrFunc);
	if(e.$children.length > 0){
		str += ">";
		for(let c of e.$children){
			str += stringify(c);
		}
		str += "</"+e.$name+">";
	} else {
		str += "/>";
	}
	return str;
}

// -----------------------

export function ivalue(type, name, value){
	return value;
}

export function vnode(inode, parent, depth, indexInParent) {
	var type = _inferType(inode),
	    name,
	    value;
	if(type == 1 || type == 9){
		name = inode.$name;
	} else if (type == 5) {
		name = parent.keys()[indexInParent];
	} else if (type == 6) {
		name = parent.keys()[indexInParent];
	} else if(type == 3 || type == 12){
		value = inode;
		name = parent.keys()[indexInParent];
	}
	// return vnode
	return new VNode(
		cx,
		inode,
		type,
		inode && inode.$ns ? q(inode.$ns.uri, name) : name,
		value,
		parent,
		depth,
		indexInParent
	);
}

export function emptyINode(type, name, attrs, ns) {
    var inode = type == 5 ? [] : {};
	if(type == 1 || type == 9){
	    inode.$name = name;
	    inode.$attrs = attrs;
		inode.$ns = ns;
		inode.$children = [];
	}
    return inode;
}

export function emptyAttrMap(init){
	return init || {};
}

export function get(inode,idx,type,cache){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		if(cache) return cache[idx];
		return _get(inode.$children,idx);
	}
	return inode[idx];
}

export function next(inode, node, type){
	type = type || _inferType(inode);
	var idx = node.indexInParent;
	if(type == 1 || type == 9) {
		return inode.$children[idx+1];
	}
	if(type == 5) return inode[idx+1];
	if(type == 6) {
		var vals = Object.values(inode);
		return vals[idx+1];
	}
}

export function push(inode,val,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		inode.$children.push(val[1]);
	} else if(type == 5) {
		inode.push(val);
	} else if(type == 6){
		inode[val[0]] = val[1];
	}
	return inode;
}

export function set(inode,key,val,type){
	// used to restore immutable parents, never modifies mutable
	return inode;
}

export function removeChild(inode,child,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		inode.$children.splice(child.indexInParent,1);
	} else if(type == 5) {
		inode.splice(child.indexInParent,1);
	} else if(type == 6){
		delete inode[child.name];
	}
	return inode;
}

export function cached(inode,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9) {
		let children = inode.$children, len = children.length, cache = multimap.default();
		for(let i = 0; i<len; i++){
			cache.push([children[i].$name || i + 1,children[i]]);
		}
		return cache;
	}
	if(type == 5) {
		return {
			keys : function(){
				return range(inode.length).toArray();
			}
		};
	}
	if(type == 6) {
		return {
			keys : function(){
				return Object.keys(inode);
			}
		};
	}
}

export function keys(inode,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9) {
		let children = inode.$children, len = children.length, keys = [];
		for(let i = 0; i<len; i++){
			keys[i] = children[i].$name || i + 1;
		}
		return keys;
	}
	if(type == 5) return range(inode.length).toArray();
	if(type == 6) return Object.keys(inode);
	return [];
}

export function values(inode,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9) return inode.$children;
	if(type == 6) return Object.values(inode);
	return inode;
}

export function finalize(inode){
	return inode;
}

export function setAttribute(inode,key,val){
	if(inode.$attrs) inode.$attrs[key]  = val;
	return inode;
}

export function getAttribute(inode,key){
	if(inode.$attrs) return inode.$attrs[key];
}

export function count(inode, type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		return inode.$children.length;
	} else if(type == 5) {
		return inode.length;
	} else if(type == 6){
		return Object.keys(inode).length;
	}
	return 0;
}

export function first(inode,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		return inode.$children[0];
	} else if(type == 5) {
		return inode[0];
	} else if(type == 6){
		return Object.values(inode)[0];
	}
}

export function last(inode,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9) return _last(inode.$children);
	if(type == 5) return _last(inode);
	if(type == 6) {
		return _last(Object.values(inode));
	}
}

export function attrEntries(inode){
	if(inode.$attrs) return Object.entries(inode.$attrs);
	return [];
}

export function modify(inode, node, ref, type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		if (ref !== undefined) {
			inode.$children.splice(ref.indexInParent,0,node.inode);
		} else {
			inode.$children.push(node.inode);
		}
	} else if(type == 5){
		if (ref !== undefined) {
			inode.splice(ref.indexInParent,0,node.inode);
		} else {
			inode.push(node.inode);
		}
	} else if(type == 6){
		inode[node.name] = node.inode;
	}
	return inode;
}

export function stringify(inode, type, root = true, key) {
	var str = "";
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		str += _elemToString(inode);
	} else if (type == 5) {
		let val = forEach(inode, c => stringify(c)).join("");
		if(key) {
			str += "<" + key + " json:type=\"array\"" + (val ? ">" + val + "</" + key + ">" : "/>");
		} else {
			str += "<json:array" + (val ? ">" + val + "</json:array>" : "/>");
		}
	} else if (type == 6) {
		let val = forEach(Object.entries(inode), c => stringify(c[1], null, false, c[0])).join("");
		if(key) {
			str += "<" + key + " json:type=\"map\"" + (val ? ">" + val + "</" + key + ">" : "/>");
		} else {
			str += "<json:map" + (val ? ">" + val + "</json:map>" : "/>");
		}
	} else {
		let val = inode === null ? "null" : inode.toString();
		if(key) {
			str += "<" + key + (type == 12 ? " json:type=\"literal\"" : "") + (val ? ">" + val + "</" + key + ">" : "/>");
		} else {
			str += type == 12 ? "<json:literal>" + val + "</json:literal>" : val;
		}
	}
	return root ? prettyXML(str) : str;
}

export const getType = _inferType;
