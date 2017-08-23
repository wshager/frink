import { VNode } from "./vnode";

import { forEach } from "./transducers";

import * as cx from "./iform";

function _inferType(node){
	var t = node.dataType;
	if(t) {
		switch(t){
		case "string":
			return 3;
		case "boolean":
		case "number":
			return 12;
		case "array":
			return 5;
		case "object":
			return 6;
		}
	}
	var nodeName = node.nodeName.toUpperCase();
	if(nodeName == "FIELDSET" || nodeName == "FORM") return 6;
	if(node.type == "number" || node.type == "checkbox") return 12;
	return 3;
}
export function ivalue(type,name,value){
	return value;
}

export function vnode(inode, parent, depth, indexInParent){
	var type = _inferType(inode);
	var format = inode.type;
	var val = inode.value;
	if(type == 12 && typeof val == "string"){
		if(format == "checkbox") {
			val = inode.checked;
		} else if(format == "number"){
			val = parseFloat(inode.value);
		}
	}
	return new VNode(cx, inode, type, inode.name, val, parent, depth, indexInParent);
}

function _inFieldset(node, parent) {
	while (node = node.parentNode, !!node && node != parent) {
		if (node.type == "fieldset") {
			return true;
		}
	}
}

export function count(inode,type,cache) {
	// filter out elements that are in form, but also in fieldset...
	var elems = inode.elements;
	if (!elems) return 0;
    if(type == 6){
        if(!cache) cache = cached(inode,type);
        elems = cache.values();
    }
	return elems.length;
}

export function keys(inode,type,cache) {
	// TODO cached
	return inode.elements ? forEach(inode.elements, n => n.name) : [];
}

function Cache(elems) {
    this.elements = elems;
}

Cache.prototype.values = function(){
    return this.elements;
};

export function cached(inode,type) {
    if(type == 6){
        return new Cache(Array.prototype.filter.call(inode.elements,e => !_inFieldset(e, inode)));
    }
}

export function first(inode,type,cache) {
	// detect / filter fieldset elements
	var elems = inode.elements;
	if (elems) {
        if(type == 6) {
            if(!cache) cache = cached(inode,type);
            elems = cache.values();
        }
		return elems[0];
	}
}

export function next(inode, node, type, cache) {
	//type = type || _inferType(type);
	var idx = node.indexInParent;
	// detect fieldset elements
	var elems = inode.elements;
	if (elems) {
        if(type == 6){
            if(!cache) cache = cached(inode,type);
            elems = cache.values();
        }
        return elems[idx + 1];
	}
}

export function get(inode,idx){
	return inode[idx];
}

export function getType(inode){
	// probably only used for empty root
	return 9;
}

export function emptyINode(type,name,depth,attrs){
}

export function emptyAttrMap(){
	// probably only used for empty root
}

export function push() {

}

export function getAttribute(inode){
	return inode.attributes[inode];
}
