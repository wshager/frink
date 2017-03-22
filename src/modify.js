import { Node, Value, Step, restoreNode, ensureRoot } from './vnode';

import { firstChild, lastNode, parent } from './access';

export function appendChild(node, child) {
	node = ensureRoot(node);
	let last = lastNode(node);
	if(node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		// TODO make protective clone (of inode)
	}

	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = restoreNode(node.inode.set(child.name,child.inode),node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? firstChild(node) : node;
}

function insertBefore(node,elem){
	node = assertPath(node);
	// find indexInParent
	let index = node.indexInParent;
	// discard path from node down
	let path = node.path.slice(0, node.index + 1);
	node.path = path;
	// create elem from parent
	// pass insertBefore index
	if(typeof elem.inode == "function") elem = elem.inode(node.parent,index);
}

export function removeChild(node,child){
	node = ensureRoot(node);
	let inode = node.inode.removeValue(child.name,child.inode);
	node.inode = restoreNode(inode,node.inode);
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = restoreNode(node.inode.set(child.name,child.inode),node.inode);
	}
	return node.type == 9 ? firstChild(node) : node;
}
