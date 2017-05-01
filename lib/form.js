"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.next = next;
exports.count = count;
exports.keys = keys;
exports.cached = cached;
exports.first = first;
exports.get = get;

var _vnode = require("./vnode");

var _transducers = require("./transducers");

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
	if (node.nodeName == "fieldset") return 6;
	if (node.type == "number" || node.type == "checkbox") return 12;
	return 3;
}
function ivalue(type, name, value) {
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
	return new _vnode.VNode(inode, type, inode.name, val, parent, depth, indexInParent);
}

function next(inode, node, type) {
	//type = type || _inferType(type);
	var idx = node.indexInParent;
	// FIXME detect fieldset elements
	var elems = inode.elements;
	if (elems) return elems[idx + 1];
}

function count(inode, type) {
	return inode.elements ? inode.elements.length : 0;
}

function keys(inode, type) {
	// TODO cached
	return inode.elements ? _transducers.forEach(inode.elements, _ => _.name) : [];
}

function cached() {}

function first(inode, type) {
	// FIXME detect / filter fieldset elements
	if (inode.elements) return inode.elements[0];
}

function get(inode, idx, type) {
	return inode[idx];
}