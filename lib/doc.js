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

var _access = require("./access");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ensureDoc(node) {
	// FIXME if isVNode(node) use cx on node
	var cx = this && this.vnode ? this : inode;
	return (0, _seq.seq)(node).concatMap(function (node) {
		if (!node.inode) {
			var type = cx.getType(node);
			if (type == 9 || type == 11) {
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
			return d.bind(node.cx || cx)(node).concatMap(function (node) {
				var next = node.first();
				return next ? (0, _seq.seq)(node.vnode(next, node, node.depth + 1, 0)) : (0, _seq.seq)();
			});
		}
		return node;
	});
}

function _d(type, children) {
	children = (0, _seq.seq)(children).concatMap(function (c) {
		return (0, _seq.isSeq)(c) ? c : (0, _access.isVNode)(c) ? (0, _seq.seq)(c) : (0, _construct.x)(c);
	});
	var cx = this.vnode ? this : inode;
	var node = cx.vnode(cx.emptyINode(type, "#document"), null, 0);
	return children.concatMap(function (child) {
		return child.inode(node);
	}).reduce(function (node, child) {
		return node.modify(child);
	}, node);
}

function d(children) {
	var cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(9, children);
}

function t(children) {
	var cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(11, children);
}