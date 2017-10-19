"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ensureDoc = ensureDoc;
exports.d = d;
exports.t = t;

var _inode = require("./inode");

var inode = _interopRequireWildcard(_inode);

var _seq = require("./seq");

var _construct = require("./construct");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ensureDoc(node) {
	if (!node) return;
	var cx = this && this.vnode ? this : inode;
	if (!node.inode) {
		var type = cx.getType(node);
		if (type == 9) {
			var root = cx.first(node);
			return cx.vnode(root, cx.vnode(node), 1, 0);
		} else {
			// create a document-fragment by default!
			var doc = t.bind(cx)();
			var _root = cx.vnode(node, doc, 1, 0);
			doc = doc.push([0, _root.inode]);
			return _root;
		}
	}
	if (typeof node.inode === "function") {
		node = node.inode(d.bind(cx)());
	}
	return node;
}

function _d(type, children) {
	var cx = this.vnode ? this : inode;
	var node = cx.vnode(cx.emptyINode(type, "#document"), null, 0);
	if (children === undefined) {
		children = [];
	} else if ((0, _seq.isSeq)(children)) {
		children = children.toArray();
	} else if (children.constructor != Array) {
		if (!children.__is_VNode) children = (0, _construct.x)(children);
		children = [children];
	}
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		child = child.inode(node);
	}
	return node.finalize();
}

function d(children) {
	var cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(9, children);
}

function t(children) {
	var cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(11, children);
}