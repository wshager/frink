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

export function next(inode, node, type){
	//type = type || _inferType(type);
	var idx = node.indexInParent;
	// FIXME detect fieldset elements
	var elems = inode.elements;
	if(elems) return elems[idx+1];
}

export function count(inode,type){
	return inode.elements ? inode.elements.length : 0;
}

export function keys(inode,type){
	// TODO cached
	return inode.elements ? forEach(inode.elements, _ => _.name) : [];
}

export function cached(){

}

export function first(inode,type){
	// FIXME detect / filter fieldset elements
	if(inode.elements) return inode.elements[0];
}

export function get(inode,idx,type){
	return inode[idx];
}
