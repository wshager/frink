import { ensureRoot } from './construct';

import { firstChild, lastChild } from './access';

function _ascend(node){
	var child;
	while (node.parent) {
		child = node;
		node = node.parent;
		node = node.set(child.name,child.inode);
	}
	// this ensures immutability
	return node.type == 9 ? firstChild(node) : node;
}

export function appendChild(node, child) {
	node = ensureRoot(node);
	//if(!node || !node.size) return;
	//let last = lastChild(node);
	if(node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	// create shallow copy of path down to lastchild of node
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		// TODO make protective clone (of inode)
		node = node.push([child.name,child.inode]);
	}
	return _ascend(node);
}

export function insertChildBefore(node,ins){
	node = ensureRoot(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if(typeof ins.inode == "function") {
		ins.inode(parent,node);
	}
	node = parent;
	return _ascend(node);
}

export function removeChild(node,child){
	node = ensureRoot(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if(child.parent.inode !== node.inode) return;
	node = node.removeValue(child.name,child.inode);
	return _ascend(node);
}
