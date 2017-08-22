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

function _inFieldset(node,parent){
	while(node = node.parentNode, !!node && node != parent){
		if(node.type == "fieldset") {
			return true;
		}
	}
}

export function count(inode){
	// filter out elements that are in form, but also in fieldset...
	if(!inode.elements) return 0;
	var len = inode.elements.length;
	if(inode.nodeName.toUpperCase() == "FORM"){
		var c = 0;
		for(var i = 0; i < len; i++){
			if(!_inFieldset(inode.elements[i],inode)) c++;
		}
		return c;
	}
	return len;
}

export function keys(inode){
	// TODO cached
	return inode.elements ? forEach(inode.elements, _ => _.name) : [];
}

export function cached(){

}

export function first(inode){
	// detect / filter fieldset elements
	if (inode.elements) {
		var idx = 0;
		var first = inode.elements[idx];
		if(inode.nodeName.toUpperCase() == "FORM") {
			while(first && _inFieldset(first,inode)) {
				first = inode.elements[++idx];
			}
		}
		return first;
	}
}

export function next(inode, node){
	//type = type || _inferType(type);
	var idx = node.indexInParent;
	// detect fieldset elements
	var elems = inode.elements;
	if (elems) {
		var next = elems[idx + 1];
		if(node.parent.inode.nodeName.toUpperCase() == "FORM") {
			while(next && _inFieldset(next,node.parent.inode)) {
				next = elems[++idx];
			}
		}
		return next;
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
