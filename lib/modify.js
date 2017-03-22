'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.removeChild = removeChild;

var _vnode = require('./vnode');

var _access = require('./access');

function appendChild(node, child) {
	node = (0, _vnode.ensureRoot)(node);
	let last = (0, _access.lastNode)(node);
	if (node.type == 9 && node.inode.size > 0) {
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
		node.inode = (0, _vnode.restoreNode)(node.inode.set(child.name, child.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? (0, _access.firstChild)(node) : node;
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
	node = (0, _vnode.ensureRoot)(node);
	let inode = node.inode.removeValue(child.name, child.inode);
	node.inode = (0, _vnode.restoreNode)(inode, node.inode);
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = (0, _vnode.restoreNode)(node.inode.set(child.name, child.inode), node.inode);
	}
	return node.type == 9 ? (0, _access.firstChild)(node) : node;
}