"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.insertChildBefore = insertChildBefore;
exports.removeChild = removeChild;

var _doc = require("./doc");

var _access = require("./access");

function _ascend(node, cx) {
	var child;
	while (node.parent) {
		child = node;
		node = node.parent;
		node = node.set(child.name, child.inode);
	}
	// this ensures immutability
	return node.type == 9 ? _access.firstChild.bind(cx)(node) : node;
}

function appendChild(node, child) {
	node = _doc.ensureDoc.bind(this)(node);
	//if(!node || !node.size) return;
	if (node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		node = node.push(child);
	}
	return _ascend(node, this);
}

function insertChildBefore(node, ins) {
	node = _doc.ensureDoc.bind(this)(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if (typeof ins.inode == "function") {
		ins.inode(parent, node);
	} else {
		// what?
	}
	node = parent;
	return _ascend(node, this);
}

function removeChild(node, child) {
	node = _doc.ensureDoc.bind(this)(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if (child.parent.inode !== node.inode) return;
	node = node.removeChild(child);
	return _ascend(node, this);
}