"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.q = undefined;
exports.e = e;
exports.l = l;
exports.m = m;
exports.a = a;
exports.p = p;
exports.x = x;
exports.c = c;
exports.d = d;
exports.ensureRoot = ensureRoot;
exports._isQName = _isQName;
exports.QName = QName;

var _vnode = require("./vnode");

var _seq = require("./seq");

function _n(type, name, children) {
	if (children === undefined) {
		children = [];
	} else if (_seq.isSeq(children)) {
		children = children.toArray();
	} else if (children.constructor != Array) {
		if (!children.__is_VNode) children = x(children);
		children = [children];
	}
	var node = new _vnode.VNode(function (parent, ref) {
		let pinode = parent.inode;
		let name = node.name,
		    ns;
		if (type == 1) {
			if (_isQName(name)) {
				ns = name;
				name = name.name;
			} else if (/:/.test(name)) {
				// TODO where are the namespaces?
			}
		}
		node.inode = _vnode.emptyINode(type, name, type == 1 ? _vnode.emptyAttrMap() : undefined, ns);
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			child = child.inode(node);
		}
		node = node.finalize();
		// insert into the parent means: update all parents until we come to the root
		// but the parents of my parent will be updated elsewhere
		// we just mutate the parent, because it was either cloned or newly created
		node.parent = parent.modify(node, ref);
		return node;
	}, type, name);
	return node;
}

function _a(type, name, val) {
	var node = new _vnode.VNode(function (parent, ref) {
		node.parent = parent.setAttribute(name, val, ref);
		return node;
	}, type, name, val);
	return node;
}

function _v(type, val, name) {
	var node = new _vnode.VNode(function (parent, ref) {
		let pinode = parent.inode;
		// reuse insertIndex here to create a named map entry
		if (node.name === undefined) node.name = pinode.count() + 1;
		node.inode = _vnode.value(node.type, node.name, val);
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		node.parent = parent.modify(node, ref);
		return node;
	}, type, name, val);
	return node;
}

/**
 * Create a provisional element VNode.
 * Once the VNode's inode function is called, the node is inserted into the parent at the specified index
 * @param  {[type]} name     [description]
 * @param  {[type]} children [description]
 * @return {[type]}          [description]
 */
function e(qname, children) {
	return _n(1, qname, children);
}

function l(name, children) {
	if (arguments.length == 1) {
		children = name;
		name = "#";
	}
	return _n(5, name, children);
}

function m(name, children) {
	if (arguments.length == 1) {
		children = name;
		name = "#";
	}
	return _n(6, name, children);
}

function a(name, value) {
	return _a(2, name, value);
}

function p(name, value) {
	return _a(7, name, value);
}

function x(name, value) {
	if (arguments.length == 1) {
		value = name;
		return _v(typeof value == "string" ? 3 : 12, value);
	}
	return _v(typeof value == "string" ? 3 : 12, value, name);
}

function c(value, name) {
	return _v(8, value, name);
}

function d(uri = null, prefix = null, doctype = null) {
	var attrs = {};
	if (uri) {
		attrs["xmlns" + (prefix ? ":" + prefix : "")] = uri;
	}
	if (doctype) {
		attrs.DOCTYPE = doctype;
	}
	return new _vnode.VNode(_vnode.emptyINode(9, "#document", 0, _vnode.emptyAttrMap(attrs)), 9, "#document");
}

function ensureRoot(node) {
	if (!node) return;
	if (!node.inode) {
		let root = _vnode.first(node);
		return _vnode.vnode(root, _vnode.vnode(node), 1, 0);
	}
	if (typeof node.inode === "function") {
		node.inode(d());
		return node;
	}
	return node;
}

function _isQName(maybe) {
	return !!(maybe && maybe.__is_QName);
}

function QName(uri, name) {
	var prefix = /:/.test(name) ? name.replace(/:.+$/, "") : null;
	return {
		__is_QName: true,
		name: name,
		prefix,
		uri: uri
	};
}

const q = exports.q = QName;