// DOM-backed VNode
import { VNode } from "./vnode";

//import { q } from "./qname";

import { filter, take, compose, into } from "./transducers";

// import self!
import * as cx from "./dom";

export const __inode_type = "dom";

const wsre = /^[\t\n\r ]*$/;
const ignoreWS = x => x.nodeType != 3 || !wsre.test(x.textContent);
const l3re = /^l3-(e?)(a?)(x?)(r?)(l?)(m?)(p?)(c?)()()(d?)()()(f?)$/;
const getL3Type = (name) => {
	return parseInt(name.replace(l3re,function(){
		for(var i=1;i<arguments.length;i++){
			if(arguments[i]) return i;
		}
	})) | 0;
};

const getQName = (inode,indexInParent) => {
	var nodeType = inode.nodeType;
	var nodeName = inode.nodeName;
	if(nodeType == 1) {
		var l3Type = getL3Type(nodeName);
		//let type = l3Type | nodeType;
		var isL3 = l3Type !== 0;
		var attrs = inode.attributes;
		return isL3 ? attrs.name : nodeName;
	} else {
		return indexInParent + 1;
	}
};

const _last = x => x[x.length - 1];

// -----------------------
// Core API
// -----------------------


export function ivalue(type, value){
	return value;
}

export function vnode(inode, parent, depth, indexInParent) {
	var nodeType = inode.nodeType;
	var nodeName = inode.nodeName;
	let isElem = nodeType == 1;
	var l3Type = isElem ? getL3Type(nodeName) : 0;
	let type = l3Type | nodeType;
	var isL3 = isElem && l3Type !== 0;
	var attrs = isElem ? inode.attributes : null;
	var name, key, value;
	if(type == 1){
		// if l3, nodeType != type
		name = isL3 ? attrs.name : nodeName;
	} else if(type == 2) {
		// no-op?
		key = inode.name;
	} else if (type == 5) {
		// no-op?
	} else if (type == 6) {
		// no-op?
	} else if(type == 3 || type == 8 || type == 12){
		value = isL3 ? inode.textContent : inode.data;
	}
	// return vnode
	return new VNode(
		cx,
		inode,
		type,
		name,
		key,
		value,
		parent,
		depth,
		indexInParent
	);
}

export function emptyINode(type, name, attrs) {
	if(type == 9) {
		// XMLDocument doesn't make sense, right?
		return document.createDocumentFragment();
	} else if(type == 11) {
		return document.createDocumentFragment();
	} else {
		// TODO l3, persistent attrs?
		var elem = document.createElement(name);
		for(var k in attrs){
			elem.attributes[k] = attrs[k];
		}
	}
}

export function emptyAttrMap(init){
	return init || {};
}

/*
export function get(inode,idx,type){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		return _get(inode.$children,idx);
	}
	return inode[idx];
}
*/
export function next(pinode, node, type){
	//var idx = node.indexInParent;
	let inode = node.inode;
	if(type == 1 || type == 9 || type == 11) {
		// ignore WS-only!
		var nxt = inode.nextSibling;
		while(nxt && !ignoreWS(nxt)){
			nxt = inode.nextSibling;
		}
		return nxt || undefined;
	}
}

export function push(inode,kv,type){
	if(type == 1 || type == 9  || type == 11){
		inode.appendChild(kv[1]);
	}
	return inode;
}

export function set(inode /*,key,val,type*/){
	// used to restore immutable parents, never modifies mutable
	return inode;
}

export function removeChild(inode,child,type){
	if(type == 1 || type == 9 || type == 11){
		// TODO removeChild et al.
		inode.removeChild(child);
	}
	return inode;
}

export function cached() {
}

export function keys(inode,type){
	if(type == 1 || type == 9 || type == 11) {
		let children = into(inode.childNodes,filter(ignoreWS),[]), len = children.length, keys = [];
		for(let i = 0; i<len; i++){
			keys[i] = getQName(children[i],i);
		}
		return keys;
	}
	// TODO l3
	//if(type == 5) return range(inode.length).toArray();
	//if(type == 6) return Object.keys(inode);
	return [];
}

export function values(inode,type){
	if(type == 1 || type == 9 || type == 11) return filter(inode.childNodes,ignoreWS);
	//if (type == 2) return [[inode.$name,inode.$value]];
	//if(type == 6) return Object.values(inode);
	//if (type == 8) return [inode.$comment];
	return inode;
}

export function finalize(inode){
	return inode;
}

export function setAttribute(inode,key,val){
	if(inode.nodeType == 1) inode.attributes[key]  = val;
	return inode;
}

export function getAttribute(inode,key){
	if(inode.nodeType == 1) return inode.attributes[key];
}

export function count(inode, type){
	if(type == 1 || type == 9 || type == 11){
		return into(inode.childNodes,filter(ignoreWS),[]).length;
	}
	// TODO l3
	return 0;
}

export function first(inode,type){
	if(type == 1 || type == 9 || type == 11){
		return into(inode.childNodes,compose(filter(ignoreWS),take(1)),[])[0];
	}
}

export function last(inode,type){
	if(type == 1 || type == 9 || type == 11) return _last(Array.from(filter(inode.childNodes,ignoreWS)));
}

export function attrEntries(inode){
	if(inode.nodeType == 1) {
		var i = [];
		try {
			for(var a of inode.attributes){
				i[a.name] = a.value;
			}
		} catch(err) {
			// whatever
		}
		return i;
	}
	return [];
}

export function modify(inode/*, node, ref, type*/){
	return inode;
}

export const getType = inode => {
	var nodeType = inode.nodeType;
	var nodeName = inode.nodeName;
	let isElem = nodeType == 1;
	return isElem ? getL3Type(nodeName) | 1 : nodeType;
};
/*
export function nodesList(node) {
	var list = [];
	var next = nextNode(node);
	do {
		list.push(next);
		next = next && nextNode(next);
	} while (next);
	return list;
}
*/
