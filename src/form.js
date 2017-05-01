import { VNode } from "./vnode";

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
	if(node.nodeName == "fieldset") return 6;
	if(node.type == "number" || node.type == "checkbox") return 12;
	return 3;
}
export function ivalue(type,name,value){
	return value;
}

export function vnode(inode, parent, depth, indexInParent){
	return new VNode(inode, _inferType(inode), inode.name, inode.value, parent, depth, indexInParent);
}

export function next(inode, node, type){
	type = type || _inferType(type);
	var idx = node.indexInParent;
	// FIXME detect fieldset elements
	var elems = inode.elements;
	if(elems) return elems[idx++];
}
