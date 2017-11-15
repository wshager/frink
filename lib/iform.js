"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.count = count;
exports.keys = keys;
exports.cached = cached;
exports.first = first;
exports.next = next;
exports.get = get;
exports.getType = getType;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.push = push;
exports.getAttribute = getAttribute;

var _vnode = require("./vnode");

var _util = require("./util");

var _iform = require("./iform");

var cx = _interopRequireWildcard(_iform);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _inferType(node) {
	var t = node.dataType;
	if (t) {
		switch (t) {
			case "string":
				return 3;
			case "boolean":
			case "number":
				return 12;
			case "array":
				return 5;
			case "object":
				return 6;
		}
	}
	var nodeName = node.nodeName.toUpperCase();
	if (nodeName == "FIELDSET" || nodeName == "FORM") return 6;
	if (node.type == "number" || node.type == "checkbox") return 12;
	return 3;
}
function ivalue(type, value) {
	return value;
}

function vnode(inode, parent, depth, indexInParent) {
	var type = _inferType(inode);
	var format = inode.type;
	var val = inode.value;
	if (type == 12 && typeof val == "string") {
		if (format == "checkbox") {
			val = inode.checked;
		} else if (format == "number") {
			val = parseFloat(inode.value);
		}
	}
	return new _vnode.VNode(cx, inode, type, inode.name, null, val, parent, depth, indexInParent);
}

function _inFieldset(node, parent) {
	while (node = node.parentNode, !!node && node != parent) {
		if (node.type == "fieldset") {
			return true;
		}
	}
}

function count(inode, type, cache) {
	// filter out elements that are in form, but also in fieldset...
	var elems = inode.elements;
	if (!elems) return 0;
	if (type == 6) {
		if (!cache) cache = cached(inode, type);
		elems = cache.values();
	}
	return elems.length;
}

function keys(inode /*,type,cache*/) {
	// TODO cached
	return inode.elements ? (0, _util.forEach)(inode.elements, function (n) {
		return n.name;
	}) : [];
}

function Cache(elems) {
	this.elements = elems;
}

Cache.prototype.values = function () {
	return this.elements;
};

function cached(inode, type) {
	if (type == 6) {
		return new Cache(Array.prototype.filter.call(inode.elements, function (e) {
			return !_inFieldset(e, inode);
		}));
	}
}

function first(inode, type, cache) {
	// detect / filter fieldset elements
	var elems = inode.elements;
	if (elems) {
		if (type == 6) {
			if (!cache) cache = cached(inode, type);
			elems = cache.values();
		}
		return elems[0];
	}
}

function next(inode, node, type, cache) {
	//type = type || _inferType(type);
	var idx = node.indexInParent;
	// detect fieldset elements
	var elems = inode.elements;
	if (elems) {
		if (type == 6) {
			if (!cache) cache = cached(inode, type);
			elems = cache.values();
		}
		return elems[idx + 1];
	}
}

function get(inode, idx) {
	return inode[idx];
}

function getType() /*inode*/{
	// probably only used for empty root
	return 9;
}

function emptyINode() /*type,name,depth,attrs*/{
	// no-op
}

function emptyAttrMap() {
	// probably only used for empty root
	// no-op
}

function push() {
	// no-op
}

function getAttribute(inode) {
	return inode.attributes[inode];
}