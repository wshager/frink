"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Value = Value;
exports.VNode = VNode;
exports.Step = Step;
exports.emptyINode = emptyINode;
exports.restoreNode = restoreNode;
exports.emptyAttrMap = emptyAttrMap;
exports.map = map;
exports.elem = elem;
exports.text = text;
exports.document = document;

var _ohamt = require("ohamt");

var ohamt = _interopRequireWildcard(_ohamt);

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _pretty = require("./pretty");

var _transducers = require("./transducers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function Value(type, name, value, depth) {
	this._type = type;
	this._name = name;
	this._value = value;
	this._depth = depth;
}

Value.prototype.count = function () {
	return 0;
};

Value.prototype.size = 0;

Value.prototype.toString = function (root = true, json = false) {
	var str = this._value + "";
	if (this._type == 3 && json) return '"' + str + '"';
	return str;
};

function VNode(inode, type, name, value, parent, indexInParent) {
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.indexInParent = indexInParent;
	Object.defineProperty(this, "children", {
		"get": () => {
			return (0, _transducers.into)(this.inode, (0, _transducers.forEach)((c, i) => new VNode(c, c._type, c._name, c._value, this.inode)), []);
		}
	});
}

VNode.prototype.toString = function () {
	return this.inode.toString();
};

VNode.prototype.clone = function () {
	return new VNode(this.inode, this.type, this.name, this.value, this.parent, this.indexInParent);
};

function Step(inode, parent, indexInParent) {
	this.inode = inode;
	this.parent = parent;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this._depth + ", closes:" + this.parent.name + "}";
};

function emptyINode(type, name, depth, attrs) {
	var inode = type == 5 ? rrb.empty.beginMutation() : ohamt.make().beginMutation();
	inode._type = type;
	inode._name = name;
	inode._depth = depth;
	inode._attrs = attrs;
	return inode;
}

function restoreNode(next, node) {
	next._type = node._type;
	next._name = node._name;
	next._attrs = node._attrs;
	next._depth = node._depth;
	return next;
}

function emptyAttrMap() {
	return ohamt.empty.beginMutation();
}

function elemToString(e) {
	const attrFunc = (z, v, k) => {
		return z += " " + k + "=\"" + v + "\"";
	};
	let str = "<" + e._name;
	str = e._attrs.reduce(attrFunc, str);
	if (e._size) {
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

OrderedMap.prototype.toString = function (root = true, json = false) {
	var str = "";
	var type = this._type;
	const docAttrFunc = (z, v, k) => z += k == "DOCTYPE" ? "<!" + k + " " + v + ">" : "<?" + k + " " + v + "?>";
	const objFunc = kv => "\"" + kv[0] + "\":" + kv[1].toString(false, true);
	if (type == 1) {
		str += elemToString(this);
	} else if (type == 3 || type == 12) {
		str += this.toString();
	} else if (type == 6) {
		str += "{";
		str += (0, _transducers.into)(this, (0, _transducers.forEach)(objFunc), []).join(",");
		str += "}";
	} else if (type == 9) {
		str = this._attrs.reduce(docAttrFunc, str);
		for (let c of this.values()) {
			str += c.toString(false);
		}
	}
	return root ? (0, _pretty.prettyXML)(str) : str;
};

var List = rrb.empty.constructor;

List.prototype.toString = function (root = true, json = false) {
	var str = "[";
	for (var i = 0, l = this.size; i < l;) {
		str += this.get(i).toString(false, true);
		i++;
		if (i < l) str += ",";
	}
	return str + "]";
};

function map(name, children) {}
/**
 * Create a provisional element VNode.
 * Once the VNode's inode function is called, the node is inserted into the parent at the specified index
 * @param  {[type]} name     [description]
 * @param  {[type]} children [description]
 * @return {[type]}          [description]
 */
function elem(name, children) {
	var node = new VNode(function (parent, insertIndex = -1) {
		var attrMap = ohamt.empty.beginMutation();
		let pinode = parent.inode;
		let inode = emptyINode(1, name, pinode._depth + 1, attrMap);
		node.inode = inode;
		// TODO remove indexInParent
		node.indexInParent = pinode.count();
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			if (child.type == 2) {
				attrMap = attrMap.set(child.name, child.value);
			} else {
				// this call will mutate me (node)!
				child = child.inode(node);
				//node.inode = restoreNode(child.parent, node.inode);
			}
		}
		node.inode = node.inode.endMutation();
		node.inode._attrs = attrMap.endMutation(true);
		// insert into the parent means: update all parents until we come to the root
		// but the parents of my parent will be updated elsewhere
		// we just mutate the parent, because it was either cloned or newly created
		if (insertIndex > -1) {
			//pinode = pinode.insert(insertIndex, node.inode);
		} else {
			// FIXME check the parent type
			parent.inode = restoreNode(pinode.push([node.name, node.inode]), pinode);
		}
		node.parent = parent;
		return node;
	}, 1, name);
	return node;
}

function text(value) {
	var node = new VNode(function (parent, insertIndex = -1) {
		let pinode = parent.inode;
		// reuse insertIndex here to create a named map entry
		let name = insertIndex > -1 ? insertIndex : pinode.count() + 1;
		node.name = name;
		node.inode = new Value(3, name, value, pinode._depth + 1);
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		parent.inode = restoreNode(pinode.push([name, node.inode]), pinode);
		node.parent = parent;
		return node;
	}, 3, null, value);
	return node;
}

function document() {
	return new VNode(emptyINode(9, "#document", 0, ohamt.empty), 9, "#document", null, [], -1);
}