"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.value = value;
exports.VNode = VNode;
exports.vnode = vnode;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;

var _construct = require("./construct");

var _pretty = require("./pretty");

var _transducers = require("./transducers");

function value(type, name, value) {
	return value;
}

function VNode(inode, type, name, value, parent, depth, indexInParent) {
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.depth = depth | 0;
	this.indexInParent = indexInParent;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function () {
	var root = _construct.ensureRoot(this);
	return root.inode.toString();
};

VNode.prototype._get = function (idx) {
	if (this.type == 1 || this.type == 9) {
		var children = this.inode.$children;
		if (typeof idx == "number") return children[idx - 1];
		var ret = [];
		for (let i = 0, l = children.length; i < l; i++) {
			if (children[i].$name == idx) ret.push(children[i]);
		}
		return ret.length == 1 ? ret[0] : ret;
	}
	return this.inode[idx];
};

VNode.prototype.count = function () {
	var type = this.type,
	    inode = this.inode;
	if (type == 1 || type == 9) return inode.$children.length;
	if (type == 5) return inode.length;
	if (type == 6) return Object.keys(inode).length;
	return 0;
};

VNode.prototype.keys = function () {
	var type = this.type,
	    inode = this.inode;
	if (type == 1 || type == 9) {
		var children = inode.$children,
		    len = children.length,
		    keys = new Array(len);
		for (let i = 0; i < len; i++) {
			keys[i] = children[i].$name || i + 1;
		}
	}
	if (type == 5) return _transducers.range(inode.length).toArray();
	if (type == 6) return Object.keys(inode);
	return [];
};

VNode.prototype.values = function () {
	var type = this.type,
	    inode = this.inode;
	if (type == 1 || type == 9) return inode.$children;
	if (type == 5) return inode;
	if (type == 6) return Object.values(inode);
	return inode;
};

VNode.prototype.first = function () {
	var type = this.type,
	    inode = this.inode;
	if (type == 1 || type == 9) return inode.$children[0];
	if (type == 5) return inode[0];
	if (type == 6) {
		// hmmm
		var first = Object.keys(inode)[0];
		return inode[first]; //[first,inode[first]];
	}
};

function _last(a) {
	return a[a.length - 1];
}

VNode.prototype.last = function () {
	var type = this.type,
	    inode = this.inode;
	if (type == 1 || type == 9) return _last(inode.$children);
	if (type == 5) return _last(inode);
	if (type == 6) {
		var last = _last(Object.keys(inode));
		return inode[last]; //[last,inode[last]];
	}
};

VNode.prototype.next = function (node) {
	var type = this.type,
	    inode = this.inode,
	    idx = node.name;
	if (type == 1 || type == 9) {
		// hmm
		var children = inode.$children;
		if (typeof idx == "number") return children[idx - 1];
		var ret = [];
		for (let i = 0, l = children.length; i < l; i++) {
			if (children[i].$name == idx && children[i] == node.inode) return children[i];
		}
	}
	if (type == 5) return inode[idx];
	if (type == 6) {
		var entry = inode[idx];
		return entry; //[entry,entry[last]];
	}
};

VNode.prototype.push = function (val) {
	var type = this.type;
	if (type == 5) {
		this.inode.push(val[1]);
	} else if (type == 6) {
		this.inode[val[0]] = val[1];
	}
	return this;
};

VNode.prototype.set = function (key, val) {
	this.inode.set(key, val);
	return this;
};

VNode.prototype.removeValue = function (key, val) {
	node.inode = restoreNode(this.inode.removeValue(key, val), node.inode);
	return this;
};

function vnode(inode, parent, depth, indexInParent) {
	var type,
	    cc = inode.constructor;
	if (cc == Array) {
		type = 5;
	} else if (cc == Object) {
		if (inode.$name) {
			type = inode.$attrs.has("DOCTYPE") ? 9 : 1;
		} else {
			type = 6;
		}
	} else {
		type = cc == Boolean || cc == Number ? 12 : 3;
	}
	return new VNode(inode, type, inode.$ns ? q(inode.$ns.uri, inode.$name) : inode.$name, type == 3 || type == 12 ? inode : null, parent, depth, indexInParent);
}

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? [] : {};
	if (type == 1 || type == 9) inode.$name = name;
	inode.$attrs = attrs;
	inode.$ns = ns;
	inode.$children = [];
	return inode;
}

function emptyAttrMap() {
	return Map();
}

function elemToString(e) {
	const attrFunc = (z, v, k) => {
		return z += " " + k + "=\"" + v + "\"";
	};
	let str = "<" + e._name;
	let ns = e._ns;
	if (ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = e._attrs.reduce(attrFunc, str);
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
/*
var OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype.toString = function(root = true, json = false){
	var str = "";
	var type = this._type;
	const docAttrFunc = (z,v,k) =>
		z += k=="DOCTYPE" ? "<!"+k+" "+v+">" : "<?"+k+" "+v+"?>";
	const objFunc = (kv) => "\""+kv[0]+"\":"+kv[1].toString(false,true);
	if(type==1) {
		str += elemToString(this);
	} else if(type==3 || type == 12){
		str += this.toString();
	} else  if(type == 6){
		str += "{";
		str += into(this,forEach(objFunc),[]).join(",");
		str += "}";
	} else if(type==9){
		str = this._attrs.reduce(docAttrFunc,str);
		for(let c of this.values()){
			str += c.toString(false);
		}
	}
	return root ? prettyXML(str) : str;
};

var List = rrb.empty.constructor;

List.prototype.__is_List = true;

List.prototype.toString = function(root = true, json = false){
	var str = "[";
	for(var i=0,l = this.size; i < l; ){
		str += this.get(i).toString(false,true);
		i++;
		if(i<l) str += ",";
	}
	return str + "]";
};
*/