"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.toL3 = toL3;
exports.fromL3 = fromL3;

var _fastintcompression = require("fastintcompression");

var _fastintcompression2 = _interopRequireDefault(_fastintcompression);

var _vnode = require("./vnode");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function str2array(str, ar = []) {
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		ar.push(str.codePointAt(i));
	}
	return ar;
}

function array2str(ar, i) {
	var str = "",
	    l = ar.length;
	for (; i < l; i++) {
		str += String.fromCodePoint(ar[i]);
	}
	return str;
}

function docAttrType(k) {
	switch (k) {
		case "DOCTYPE":
			return 10;
		default:
			return 7;
	}
}

/**
 * Create a flat buffer from the document tree
 * @param  {VNode} doc The document
 * @return {ArrayBuffer}  A flat buffer
 */
function toL3(doc) {
	var out = [],
	    names = {},
	    i = 1;
	for (let attr of doc._attrs.entries()) {
		let name = attr[0],
		    attrname = "@" + name;
		if (!names[attrname]) {
			names[attrname] = i;
			i++;
			out.push(0);
			out.push(15);
			out = str2array(name, out);
		}
		out.push(docAttrType(attr[0]));
		out = str2array(attr[0], out);
		out = str2array(attr[1], out);
	}
	iter(doc, function (node) {
		let type = node.type,
		    vnode = node.vnode,
		    depth = vnode._depth,
		    name = node.name;
		if (type == 1) {
			if (!names[name]) {
				names[name] = i;
				i++;
				out.push(0);
				out.push(15);
				out = str2array(name, out);
			}
			out.push(0);
			out.push(type);
			out.push(depth);
			out.push(names[name]);
			for (let attr of vnode._attrs.entries()) {
				let name = attr[0],
				    attrname = "@" + name;
				if (!names[attrname]) {
					names[attrname] = i;
					i++;
					out.push(0);
					out.push(15);
					out = str2array(name, out);
				}
				out.push(0);
				out.push(12);
				out.push(names[attrname]);
				out = str2array(attr[1], out);
			}
		} else if (type == 3) {
			out.push(0);
			out.push(type);
			out.push(depth);
			out = str2array(node.value, out);
		}
	});
	return _fastintcompression2.default.compress(out);
}

function fromL3(buf) {
	var l3 = _fastintcompression2.default.uncompress(buf);
	var names = {},
	    n = 1,
	    parents = [],
	    depth = 0,
	    c = 0;
	var doc = (0, _vnode.emptyVNode)(9, "#document", -1, ohamt.empty.beginMutation());
	parents[0] = doc;
	function process(entry) {
		var type = entry[0];
		switch (type) {
			case 1:
				{
					depth = entry[1];
					let name = names[entry[2]];
					let node = (0, _vnode.emptyVNode)(type, name, depth, ohamt.empty.beginMutation());
					let parent = parents[depth - 1];
					if (parent) parent = parent.push(name, node);
					parents[depth] = node;
					break;
				}
			case 2:
				{
					let name = names[entry[1]];
					let parent = parents[depth];
					parent._attrs = parent._attrs.push(name, array2str(entry, 2));
					break;
				}
			case 3:
				{
					depth = entry[1];
					let parent = parents[depth - 1];
					let name = parent.count();
					let node = new _vnode.Value(type, name, array2str(entry, 2), depth);
					parent = parent.push(name, node);
					break;
				}
			case 7:
			case 10:
				doc._attrs = doc._attrs.push(entry[1], array2str(entry, 2));
				break;
			case 15:
				names[n] = array2str(entry, 1);
				n++;
				break;
		}
	}
	var entry = [];
	for (var i = 0, l = l3.length; i < l; i++) {
		if (l3[i] === 0) {
			process(entry);
			entry = [];
		} else {
			entry.push(l3[i]);
		}
	}
	return parents[0];
}

function iter(node, f) {
	// FIXME pass doc?
	while (node) {
		if (!node.vnode) {
			let root = firstNode(node);
			node = new _vnode.Node(root, root._type, root._name, root._value, [], 0, node, 0);
			node.path.push(node);
			f(node);
		} else {
			node = nextNode(node);
			if (node) f(node);
		}
	}
}