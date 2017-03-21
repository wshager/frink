'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.removeChild = removeChild;

var _vnode = require('./vnode');

var _access = require('./access');

function assertPath(node) {
	if (node.index < 0) return node;
	var lastIndex = node.path.length - 1;
	if (node.index > lastIndex) {
		console.log("Node not in path");
		var last = node.path[lastIndex];
		let next = nextNode(node);
		while (next) {
			next = nextNode(next);
			if (next.inode === node.inode) {
				return next;
			}
		}
	}
	return node;
}

function assertNotInPath(child) {
	var check = assertPath(child);
	if (check) {
		console.log("child exists");
		// TODO clone child
	}
	return child;
}

function appendChild(node, child) {
	// check if path to node is set
	//node = assertPath(node);
	let last = (0, _access.lastNode)(node);
	if (node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	//let path = last.path.slice(0, last.index + 1);
	node = node.clone();
	//node.path = path;
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {}
	// TODO FIXME check if child exists as-is
	//child = assertNotInPath(child);
	//child = child.clone();

	// overwrite parent in prevNode
	//node.inode = restoreNode(child.parent,node.inode);
	//if(node.index < 0) return node;
	while (node.parent.type != 9) {
		child = node;
		node = node.parent.clone();
		node.inode = (0, _vnode.restoreNode)(node.inode.set(child.name, child.inode), node.inode);
	}
	return node;
}

function insertBefore(node, elem) {
	node = assertPath(node);
	// find indexInParent
	let index = node.indexInParent;
	// discard path from node down
	let path = node.path.slice(0, node.index + 1);
	node.path = path;
	// create elem from parent
	// pass insertBefore index
	if (typeof elem.inode == "function") elem = elem.inode(node.parent, index);
}

function removeChild(node, child) {
	node = assertPath(node);
	child = assertPath(child);
	let index = node.index;
	// shallow copy up to, but not including, child
	let path = child.path.slice(0, child.index);
	let inode = node.inode.removeValue(child.name, child.inode);
	node = node.clone();
	node.path = path;
	// overwrite parent in prevNode
	node.inode = (0, _vnode.restoreNode)(inode, node.inode);
	if (node.index < 0) return node;
	node.parent = (0, _vnode.restoreNode)(node.parent.set(node.name, node.inode), node.parent);
	node.path[node.index] = node;
	child = node;
	while (node.inode._depth > 1) {
		// overwrite parent in prevNode
		node = (0, _access.parent)(node).clone();
		node.inode = child.parent;
		node.path = path;
		node.path[node.index] = node;
		node.parent = (0, _vnode.restoreNode)(node.parent.set(node.name, node.inode), node.parent);
		if (node.parent._type == 9) break;
		child = node;
	}
	return node.path[index];
}
