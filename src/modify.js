import { ensureDoc } from "./doc";

import { firstChild } from './access';

function _ascend(node,cx){
	var child;
	while (node.parent) {
		child = node;
		node = node.parent;
		node = node.set(child.name,child.inode);
	}
	// this ensures immutability
	return node.type == 9 ? firstChild.bind(cx)(node) : node;
}

export function appendChild(node, child) {
	node = ensureDoc.bind(this)(node);
	//if(!node || !node.size) return;
	if(node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		node = node.push(child);
	}
	return _ascend(node,this);
}

export function insertChildBefore(node,ins){
	node = ensureDoc.bind(this)(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if(typeof ins.inode == "function") {
		ins.inode(parent,node);
	} else {
		// what?
	}
	node = parent;
	return _ascend(node,this);
}

export function removeChild(node,child){
	node = ensureDoc.bind(this)(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if(child.parent.inode !== node.inode) return;
	node = node.removeChild(child);
	return _ascend(node,this);
}
