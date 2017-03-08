"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;

var _vnode = require("./vnode");

function assertPath(node) {
	if (node.index < 0) return node;
	var lastIndex = node.path.length - 1;
	if (node.index > lastIndex) {
		console.log("Node not in path");
		var last = node.path[lastIndex];
		let next = nextNode(node);
		while (next) {
			next = nextNode(next);
			if (next.vnode === node.vnode) {
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
	node = assertPath(node);
	let last = lastNode(node);
	if (node.type == 9 && node.vnode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	let path = last.path.slice(0, last.index + 1);
	//node = cloneNode(node);
	node.path = path;
	if (typeof child.vnode === "function") {
		child = child.vnode(node);
	} else {
		child = assertNotInPath(child);
	}
	// overwrite parent in prevNode
	node.vnode = restoreNode(child.parent, node.vnode);
	if (node.index < 0) return node;
	node.parent = restoreNode(node.parent.push(node.vnode), node.parent);
	node.path[node.index] = node;
	child = node;
	while (node.vnode._depth > 0) {
		// overwrite parent in prevNode
		node = parent(node);
		node.vnode = child.parent;
		node.path = path;
		node.path[node.index] = node;
		node.parent = restoreNode(node.parent.push(node.vnode), node.parent);
		if (node.parent._type == 9) break;
		child = node;
	}
	return node.path[index];
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
	if (typeof elem.vnode == "function") elem = elem.vnode(node.parent, index);
}