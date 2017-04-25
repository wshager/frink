'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.insertChildBefore = insertChildBefore;
exports.removeChild = removeChild;

var _construct = require('./construct');

var _access = require('./access');

function _ascend(node) {
	var child;
	while (node.parent) {
		child = node;
		node = node.parent;
		node = node.set(child.name, child.inode);
	}
	// this ensures immutability
	return node.type == 9 ? _access.firstChild(node) : node;
}

function appendChild(node, child) {
	node = _construct.ensureRoot(node);
	//if(!node || !node.size) return;
	//let last = lastChild(node);
	if (node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	// create shallow copy of path down to lastchild of node
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		// TODO make protective clone (of inode)
		node = node.push(child);
	}
	return _ascend(node);
}

function insertChildBefore(node, ins) {
	node = _construct.ensureRoot(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if (typeof ins.inode == "function") {
		ins.inode(parent, node);
	} else {
		// what?
	}
	node = parent;
	return _ascend(node);
}

function removeChild(node, child) {
	node = _construct.ensureRoot(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if (child.parent.inode !== node.inode) return;
	node = node.removeChild(child);
	return _ascend(node);
}