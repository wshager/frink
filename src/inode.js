import { VNode } from "./vnode";

import { q } from './qname';

import { prettyXML } from "./pretty";

import { forEach, foldLeft, into, range } from "./transducers";

import * as multimap from "./multimap";

import * as entries from "entries";

// import self!
import * as cx from "./inode";

// helpers ---------------

function _inferType(inode){
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
	return a[a.length-1];
}

function _elemToString(e){
	const attrFunc = (z,kv) => {
		return z += " "+kv[0]+"=\""+kv[1]+"\"";
	};
	let str = "<"+e.$name;
	let ns = e.$ns;
	if(ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = foldLeft(entries.default(e.$attrs),str,attrFunc);
	if(e.$children.length > 0){
		str += ">";
		for(let c of e.$children){
			str += stringify(c,false);
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
	    value,
	    cc = inode.constructor;
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
		inode.$ns ? q(inode.$ns.uri, name) : name,
		value,
		parent,
		depth,
		indexInParent
	);
}

export function emptyINode(type, name, attrs, ns) {
    var inode = type == 5 ? [] : {};
	if(type == 1 || type == 9)
    inode.$name = name;
    inode.$attrs = attrs;
	inode.$ns = ns;
	inode.$children = [];
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
		var values = Object.values(inode);
		return values[idx+1];
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
	if(inode.$attrs) return entries.default(inode.$attrs);
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

export function stringify(inode,type,root=true){
	var str = "";
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		str += _elemToString(inode);
	} else if(type == 5){
		str += "<json:array>";
		str += forEach(inode,c => stringify(c,false,json)).join("");
		str += "</json:array>";
	} else if(type == 6){
		str += "<json:map>";
		str += forEach(entries.default(inode),c => '"'+c[0]+'":'+stringify(c[1],false,json)).join("");
		str += "</json:map>";
	} else {
		str = inode.toString();
	}
	return root ? prettyXML(str) : str;
}
