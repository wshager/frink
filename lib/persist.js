"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.get = get;
exports.next = next;
exports.push = push;
exports.set = set;
exports.removeChild = removeChild;
exports.cached = cached;
exports.keys = keys;
exports.values = values;
exports.finalize = finalize;
exports.setAttribute = setAttribute;
exports.count = count;
exports.first = first;
exports.last = last;
exports.attrEntries = attrEntries;
exports.modify = modify;
exports.stringify = stringify;

var _ohamt = require("ohamt");

var ohamt = _interopRequireWildcard(_ohamt);

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _vnode = require("./vnode");

var _construct = require("./construct");

var _pretty = require("./pretty");

var _transducers = require("./transducers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// helpers ---------------

function Value(type, name, value) {
	this._type = type;
	this._name = name;
	this._value = value;
}

Value.prototype.__is_Value = true;

Value.prototype.get = function () {
	return this._value;
};

Value.prototype[Symbol.iterator] = function* () {
	yield this;
};

Value.prototype.values = function () {
	return this[Symbol.iterator]();
};

Value.prototype.count = function () {
	return 0;
};

Value.prototype.size = 0;

Value.prototype.toString = function (root = true, json = false) {
	var str = this._value + "";
	if (this._type == 3 && json) return '"' + str + '"';
	return str;
};

function _restore(next, node) {
	next._type = node._type;
	next._name = node._name;
	next.$attrs = node.$attrs;
	next._ns = node._ns;
	return next;
}

function _elemToString(e) {
	const attrFunc = (z, v, k) => {
		return z += " " + k + "=\"" + v + "\"";
	};
	let str = "<" + e._name;
	let ns = e._ns;
	if (ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = e.$attrs.reduce(attrFunc, str);
	if (e.size > 0) {
		str += ">";
		for (let c of e.values()) {
			str += c.toString(false);
		}
		str += "</" + e._name + ">";
	} else {
		str += "/>";
	}
	return str;
}

var OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype.toString = function (root = true, json = false) {
	var str = "";
	var type = this._type;
	const docAttrFunc = (z, v, k) => z += k == "DOCTYPE" ? "<!" + k + " " + v + ">" : "<?" + k + " " + v + "?>";
	const objFunc = kv => "\"" + kv[0] + "\":" + kv[1].toString(false, true);
	if (type == 1) {
		str += _elemToString(this);
	} else if (type == 3 || type == 12) {
		str += this.toString();
	} else if (type == 6) {
		str += "{";
		str += _transducers.into(this, _transducers.forEach(objFunc), []).join(",");
		str += "}";
	} else if (type == 9) {
		str = this.$attrs.reduce(docAttrFunc, str);
		for (let c of this.values()) {
			str += c.toString(false);
		}
	}
	return root ? _pretty.prettyXML(str) : str;
};

var List = rrb.empty.constructor;

List.prototype.__is_List = true;

List.prototype.toString = function (root = true, json = false) {
	var str = "[";
	for (var i = 0, l = this.size; i < l;) {
		str += this.get(i).toString(false, true);
		i++;
		if (i < l) str += ",";
	}
	return str + "]";
};

// -----------------------

function ivalue(type, name, value) {
	return new Value(type, name, value);
}

function vnode(inode, parent, depth, indexInParent) {
	return new _vnode.VNode(inode, inode._type, inode._ns ? _construct.q(inode._ns.uri, inode._name) : inode._name, inode._value, parent, depth, indexInParent);
}

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? rrb.empty.beginMutation() : ohamt.make().beginMutation();
	inode._type = type;
	inode._name = name;
	inode.$attrs = attrs;
	inode._ns = ns;
	return inode;
}

function emptyAttrMap(init) {
	var attrs = ohamt.empty.beginMutation();
	if (init) for (var k in init) attrs = attrs.set(k, init[k]);
	return attrs;
}

function get(inode, idx) {
	return inode.get(idx);
}

function next(inode, node) {
	return inode.next(node.name, node.inode);
}

function push(inode, val, type) {
	type = type || inode._type;
	if (type == 1 || type == 9) {
		return _restore(inode.push(val), inode);
	} else if (type == 5) {
		return _restore(inode.push(val[1]), inode);
	} else if (type == 6) {
		return _restore(inode.set(val[0], val[1]), inode);
	}
	return inode;
}

function set(inode, key, val) {
	return _restore(inode.set(key, val), inode);
}

function removeChild(inode, child, type) {
	type = type || inode._type;
	var key = child.name,
	    val = child.inode;
	if (type == 1 || type == 9) {
		return _restore(inode.removeValue(key, val), inode);
	} else if (type == 5 || type == 6) {
		return _restore(inode.remove(key), inode);
	}
	return inode;
}

function cached(inode, type) {}

function keys(inode, type) {
	return inode.keys();
}

function values(inode) {
	return inode.values();
}

function finalize(inode) {
	if (inode.$attrs) inode.$attrs = inode.$attrs.endMutation();
	return inode.endMutation();
}

function setAttribute(inode, key, val) {
	if (inode.$attrs) inode.$attrs = inode.$attrs.set(key, val);
	return inode;
}

function count(inode) {
	return inode.count();
}

function first(inode) {
	return inode.first();
}

function last(inode) {
	return inode.last();
}

function attrEntries(inode) {
	return inode.$attrs.entries();
}

function modify(inode, node, ref, type) {
	type = type || inode._type;
	if (type == 1 || type == 9) {
		if (ref !== undefined) {
			return _restore(inode.insertBefore([ref.name, ref.inode], [node.name, node.inode]), inode);
		} else {
			// FIXME check the parent type
			return _restore(inode.push([node.name, node.inode]), inode);
		}
	} else if (type == 5) {
		if (ref !== undefined) {
			return _restore(inode.insertBefore(ref, node.inode), inode);
		} else {
			return _restore(inode.push(node.inode), inode);
		}
	} else if (type == 6) {
		return _restore(inode.set(node.name, node.inode), inode);
	}
	return inode;
}

function stringify(inode) {
	return inode.toString();
}