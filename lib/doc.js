"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ensureDoc = ensureDoc;
exports.d = d;

var _persist = require("./persist");

var inode = _interopRequireWildcard(_persist);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ensureDoc(node) {
	if (!node) return;
	var cx = this.vnode ? this : inode;
	if (!node.inode) {
		let root = cx.first(node);
		return cx.vnode(root, cx.vnode(node), 1, 0);
	}
	if (typeof node.inode === "function") {
		node.inode(d.bind(cx)());
		return node;
	}
	return node;
}

function d(uri = null, prefix = null, doctype = null) {
	var attrs = {};
	var cx = this.vnode ? this : inode;
	if (uri) {
		attrs["xmlns" + (prefix ? ":" + prefix : "")] = uri;
	}
	if (doctype) {
		attrs.DOCTYPE = doctype;
	}
	return cx.vnode(cx.emptyINode(9, "#document", 0, cx.emptyAttrMap(attrs)), 9, "#document");
}