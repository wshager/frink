'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.insertChildBefore = insertChildBefore;
exports.removeChild = removeChild;

var _vnode = require('./vnode');

var _access = require('./access');

function appendChild(node, child) {
	node = _vnode.ensureRoot(node);
	//if(!node || !node.size) return;
	//let last = lastChild(node);
	if (node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		// TODO make protective clone (of inode)
		node.inode = _vnode.restoreNode(node.inode.push([child.name, child.inode]), node.inode);
	}
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = _vnode.restoreNode(node.inode.set(child.name, child.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? _access.firstChild(node) : node;
}

function insertChildBefore(node, ins) {
	node = _vnode.ensureRoot(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if (typeof ins.inode == "function") {
		ins.inode(parent, node);
	}
	node = parent;
	while (node.parent) {
		ins = node;
		node = node.parent;
		node.inode = _vnode.restoreNode(node.inode.set(ins.name, ins.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? _access.firstChild(node) : node;
}

function removeChild(node, child) {
	node = _vnode.ensureRoot(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if (child.parent.inode !== node.inode) return;
	let inode = node.inode.removeValue(child.name, child.inode);
	node.inode = _vnode.restoreNode(inode, node.inode);
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = _vnode.restoreNode(node.inode.set(child.name, child.inode), node.inode);
	}
	return node.type == 9 ? _access.firstChild(node) : node;
}