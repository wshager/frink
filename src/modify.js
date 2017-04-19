import { Node, Value, Step, restoreNode, ensureRoot } from './vnode';

import { firstChild, lastChild } from './access';

export function appendChild(node, child) {
	node = ensureRoot(node);
	//if(!node || !node.size) return;
	//let last = lastChild(node);
	if(node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		// TODO make protective clone (of inode)
		node.inode = restoreNode(node.inode.push([child.name,child.inode]), node.inode);
	}
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = restoreNode(node.inode.set(child.name,child.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? firstChild(node) : node;
}

export function insertChildBefore(node,ins){
	node = ensureRoot(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if(typeof ins.inode == "function") {
		ins.inode(parent,node);
	}
	node = parent;
	while (node.parent) {
		ins = node;
		node = node.parent;
		node.inode = restoreNode(node.inode.set(ins.name,ins.inode),node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? firstChild(node) : node;
}

export function removeChild(node,child){
	node = ensureRoot(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if(child.parent.inode !== node.inode) return;
	let inode = node.inode.removeValue(child.name,child.inode);
	node.inode = restoreNode(inode,node.inode);
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = restoreNode(node.inode.set(child.name,child.inode),node.inode);
	}
	return node.type == 9 ? firstChild(node) : node;
}
