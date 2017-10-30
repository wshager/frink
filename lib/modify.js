"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.insertChildBefore = insertChildBefore;
exports.removeChild = removeChild;

var _seq = require("./seq");

var _doc = require("./doc");

var _access = require("./access");

var _inode = require("./inode");

var inode = _interopRequireWildcard(_inode);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _isDocOrFrag = function _isDocOrFrag(node) {
	return node.type == 9 || node.type == 11;
};

function _ascend(node, cx) {
	var child;
	while (node.parent) {
		child = node;
		node = node.parent;
		node = node.set(child.name, child.inode);
	}
	// this ensures immutability
	return _isDocOrFrag(node) ? _access.firstChild.bind(cx)(node) : node;
}

function appendChild(node, child) {
	var cx = this && "vnode" in this ? this : inode;
	return _doc.ensureDoc.bind(cx)(node).concatMap(function (node) {
		//if(!node || !node.size) return;
		if (_isDocOrFrag(node) && node.count() > 0) {
			throw new Error("Document can only contain one child.");
		}
		return child.concatMap(function (child) {
			return typeof child.inode === "function" ? child.inode(node) : (0, _seq.seq)(child);
		}).reduce(function (node, child) {
			return node.modify(child);
		}, node);
		//.map(node =>
		//	(0, _seq.seq)(_ascend(node, cx))
		//);
	});
}

function insertChildBefore(node, ins) {
	node = _doc.ensureDoc.bind(this)(node);
	//if(!node || !node.size) return;
	var parent = node.parent;
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