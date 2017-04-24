(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.amd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isNode = exports.last = exports.position = undefined;
exports.docIter = docIter;
exports.nextNode = nextNode;
exports.prevNode = prevNode;
exports.stringify = stringify;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.children = children;
exports.getRoot = getRoot;
exports.getDoc = getDoc;
exports.lastChild = lastChild;
exports.parent = parent;
exports.self = self;
exports.iter = iter;
exports.cxFilter = cxFilter;
exports.element = element;
exports.attribute = attribute;
exports.text = text;
exports.node = node;
exports.child = child;
exports.followingSibling = followingSibling;
exports.select = select;
exports.selectAttribute = selectAttribute;
exports.isEmptyNode = isEmptyNode;
exports.name = name;

var _vnode = require("./vnode");

var _transducers = require("./transducers");

var _seq = require("./seq");

var _pretty = require("./pretty");

function* docIter(node, reverse = false) {
	node = _vnode.ensureRoot(node);
	yield node;
	while (node) {
		node = nextNode(node);
		if (node) yield node;
	}
}

function nextNode(node /* VNode */) {
	var type = node.type,
	    inode = node.inode,
	    parent = node.parent,
	    indexInParent = node.indexInParent || 0;
	var depth = node.depth || 0;
	if (type != 17 && node.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = node;
		inode = node.first();
		// TODO handle arrays
		node = _vnode.vnode(inode, parent, depth, indexInParent);
		//console.log("found first", node.name, depth,indexInParent);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.count() == indexInParent) {
			//inode = parent;
			depth--;
			node = node.parent;
			if (depth === 0 || !node) return;
			inode = node.inode;
			node = new _vnode.Step(inode, node.parent, depth, node.indexInParent);
			//console.log("found step", node.name, depth, indexInParent);
			return node;
		} else {
			// return the next child
			inode = parent.next(node);
			if (inode) {
				node = _vnode.vnode(inode, parent, depth, indexInParent);
				//console.log("found next", node.name, depth, indexInParent);
				return node;
			}
			throw new Error("Node " + parent.name + " hasn't been completely traversed. Found " + indexInParent + ", contains " + parent.count());
		}
	}
}

function* prevNode(node) {
	var depth = node.depth;
	while (node) {
		if (!node.size) {
			depth--;
			node = node.parent;
			if (!node) break;
			yield node;
		} else {
			if (!("indexInParent" in node)) node.indexInParent = node.parent.size;
			node.indexInParent--;
			node = node.getByIndex(node.indexInParent);
		}
	}
}

function stringify(input) {
	var str = "";
	const attrFunc = (z, v, k) => {
		return z += " " + k + "=\"" + v + "\"";
	};
	const docAttrFunc = (z, v, k) => {
		return z += k == "DOCTYPE" ? "<!" + k + " " + v + ">" : "<?" + k + " " + v + "?>";
	};
	for (let node of docIter(input)) {
		let type = node.type;
		if (type == 1) {
			str += "<" + node.name;
			str = node.attrs.reduce(attrFunc, str);
			if (!node.count()) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			str += node.attrs.reduce(docAttrFunc, str);
		} else if (type == 17) {
			if (type == 1) str += "</" + node.name + ">";
		}
	}
	return _pretty.prettyXML(str);
}

function firstChild(node, fltr = 0) {
	// FIXME return root if doc (or something else?)
	var next = _vnode.ensureRoot(node);
	if (!node.inode) return next;
	next = nextNode(next);
	if (node.depth == next.depth - 1) return next;
}

function nextSibling(node) {
	node = _vnode.ensureRoot(node);
	var parent = node.parent;
	var next = parent.next(node);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return _vnode.vnode(next, parent, node.depth, node.indexInParent + 1);
}

function* children(node) {
	var inode = node;
	var i = 0,
	    iter = node.values();
	while (!iter.done) {
		let c = iter.next().value;
		yield _vnode.vnode(c, node, node.depth + 1, i);
		i++;
	}
}

function getRoot(node) {
	do {
		node = node.parent;
	} while (node.parent);
	return node;
}

function getDoc(node) {
	return getRoot(node);
}

function lastChild(node) {
	node = _vnode.ensureRoot(node);
	var last = node.last();
	return _vnode.vnode(last, node, node.depth + 1);
}

function parent(node) {
	if (!arguments.length) return Axis(parent);
	return node.parent ? _seq.seq(new _vnode.VNodeIterator([node.parent.inode][Symbol.iterator](), node.parent.parent, _vnode.vnode)) : _seq.seq();
}

function self(node) {
	if (!arguments.length) return Axis(self);
	return node ? _seq.seq(new _vnode.VNodeIterator([node.inode][Symbol.iterator](), node.parent, _vnode.vnode)) : _seq.seq();
}

function iter(node, f) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = node => {
		prev = node;
	};
	node = _vnode.ensureRoot(node);
	f(node, i++);
	while (node) {
		node = nextNode(node);
		if (node) {
			f(node, i++);
		}
	}
	return prev;
}

const _isVNode = n => !!n && n.__is_VNode;

const _isElement = n => _isVNode(n) && n.type == 1;

const _isAttribute = n => _isVNode(n) && n.type == 2;

const _isText = n => _isVNode(n) && n.type == 3;

const _isList = n => _isVNode(n) && n.type == 5;

const _isMap = n => _isVNode(n) && n.type == 6;

const _isLiteral = n => _isVNode(n) && n.type == 12;

function _get(idx, type) {
	return {
		__is_Accessor: true,
		f: _transducers.filter(n => n.name === idx),
		__type: type,
		__index: idx
	};
}

function cxFilter(iterable, f) {
	return _transducers.filter(iterable, function (v, k, i) {
		if (!_seq.isSeq(v) && !isNode(v)) v = _seq.seq(v);
		v.__cx = [k, i];
		return f(v, k, i);
	});
}

const position = exports.position = n => n.__cx ? n.__cx[0] + 1 : n.indexInParent;

const last = exports.last = n => n.__cx ? n.__cx[1].size : n.parent ? n.parent.size : 1;

// TODO convert qname to integer when parent is array
function _nodeTest(qname) {
	if (qname === undefined) {
		return _transducers.filter(_isElement);
	} else {
		var hasWildcard = /\*/.test(qname);
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			return _seq.seq(_transducers.filter(_isElement), _transducers.filter(n => regex.test(n.name)));
		} else {
			return _seq.seq(_get(qname, 1), _transducers.filter(_isElement));
		}
	}
}

function element(qname) {
	return _seq.seq(child(), _nodeTest(qname));
}

function _attrGet(node, key) {
	var iter;
	if (key !== undefined) {
		var val = node.attrs.get(key);
		if (!val) return [];
		iter = [[key, val]];
	} else {
		iter = node.attrs;
	}
	return new _vnode.VNodeIterator(iter[Symbol.iterator](), node, (v, parent, index) => _vnode.vnode(new _vnode.Value(2, v[0], v[1], node.depth + 1), parent, index));
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
function attribute(qname, node) {
	if (arguments.length < 2) return Axis(attribute.bind(null, qname), 2);
	var hasWildcard = /\*/.test(qname);
	if (hasWildcard) {
		var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		return _transducers.into(_attrGet(node), _transducers.filter(n => regex.test(n.name)), _seq.seq());
	}
	return _seq.seq(_attrGet(node, qname));
}

// FIXME should this be in document order?
function _getTextNodes(n) {
	//if (isSeq(n)) return into(n, compose(filter(_ => _isElement(_)), forEach(_ => _getTextNodes(_), cat)), seq());
	return;
}

function text() {
	return n => _isText(n) && !!n.value;
}

function node() {
	return _transducers.filter(n => _isElement(n) || _isText(n));
}

// TODO create axis functions that return a function
// child(element(qname))
// works like a filter: filter(children(node|nodelist),n => element(qname,n))
// nextSibling(element()): filter(nextSibling(node|nodelist),n => element(undefined,n))
// filterOrGet: when f is called, and null or wildcard match was supplied as its qname parameter, call filter
// else call get
// if it is a seq, apply the function iteratively:
// we don't want to filter all elements from a seq, we want to retrieve all elements from elements in a seq
// final edge case: when node is of type array, and name is not an integer: filter
function Axis(f, type) {
	return {
		__is_Axis: true,
		__type: type || 1,
		f: f
	};
}
function child() {
	return Axis(x => _seq.seq(_vnode.ensureRoot(x)));
}

const _isSiblingIterator = n => !!n && n.__is_SiblingIterator;

const _isVNodeIterator = n => !!n && n.__is_VNodeIterator;

function SiblingIterator(inode, parent, depth, indexInParent, dir) {
	this.inode = inode;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
	this.dir = dir;
	this.__is_SiblingIterator = true;
}

const DONE = {
	done: true
};

SiblingIterator.prototype.next = function () {
	var v = this.dir.call(this.parent.inode, this.name, this.inode);
	this.index++;
	if (!v) return DONE;
	this.inode = v;
	return { value: _vnode.vnode(v, this.parent, this.depth, this.indexInParent) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
	return this;
};

function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = _vnode.ensureRoot(node);
	return _seq.seq(new SiblingIterator(node.inode, node.parent, node.depth, node.indexInParent, next));
}

// make sure all paths are transducer-funcs
function select(node, ...paths) {
	// usually we have a sequence
	var cur = node,
	    path;
	while (paths.length > 0) {
		path = paths.shift();
		cur = _selectImpl(cur, path);
	}
	return cur;
}

function selectAttribute(node, ...paths) {
	// usually we have a sequence
	var cur = node,
	    path;
	while (paths.length > 0) {
		path = paths.shift();
		cur = _selectImpl(cur, path, true);
	}
	return cur;
}

function _comparer() {
	// dirty preserve state on function
	var f = function (seq, node) {
		var has = f._checked.has(node.inode);
		if (!has) f._checked.set(node.inode, true);
		return !has;
	};
	f._checked = new WeakMap();
	return f;
}

// TODO use direct functions as much as passible, e.g. _isNode instead of node
function _selectImpl(node, path) {
	if (!_seq.isSeq(path)) path = _seq.seq(path);
	var axis = self(),
	    directAccess;
	// process strings (can this be combined?)
	path = _transducers.transform(path, _transducers.compose(_transducers.forEach(function (path) {
		if (typeof path == "string") {
			var at = /^@/.test(path);
			if (at) path = path.substring(1);
			return at ? attribute(path) : element(path);
		}
		return [path];
	}), _transducers.cat));
	var filtered = _transducers.transform(path, _transducers.compose(_transducers.forEach(function (path) {
		if (path.__is_Axis) {
			axis = path;
		} else if (path.__is_Accessor) {
			directAccess = path.__index;
			return path.f;
		} else {
			return path;
		}
	}), _transducers.filter(_ => !!_)));

	var attr = axis.__type == 2;
	var composed = _transducers.compose.apply(null, filtered.toArray());
	const process = n => _transducers.into(directAccess && !_isVNodeIterator(n) && !_isSiblingIterator(n) ? n.get(directAccess) : n, composed, _seq.seq());
	//var nodeFilter = n => _isElement(n) || _isVNodeIterator(n) || _isSiblingIterator(n) || _isMap(n) || _isList(n);
	// if seq, apply axis to seq first
	// if no axis, expect context function call, so don't process + cat
	var list = _seq.isSeq(node) ? node = _transducers.transform(node, _transducers.compose(_transducers.forEach(n => axis.f(n)), _transducers.cat)) : axis.f(node);
	return _transducers.transform(list, _transducers.compose(_transducers.forEach(process), (n, k, i, z) => !isNode(n) || attr ? _transducers.cat(_seq.isSeq(n) ? n : [n], k, i, z) : _transducers.distinctCat(_comparer())(n, k, i, z)));
}

function isEmptyNode(node) {
	node = _vnode.ensureRoot(node);
	if (!_isVNode(node)) return false;
	if (_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.count();
}

const isNode = exports.isNode = _isVNode;

function name($a) {
	if (_seq.isSeq($a)) return _transducers.forEach($a, name);
	if (!_isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}
},{"./pretty":6,"./seq":8,"./transducers":9,"./vnode":10}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.nodesList = nodesList;
exports.nextNode = nextNode;
function Step(node, depth) {
	this.node = node;
	this.nodeName = node.nodeName;
	this.parentNode = node.parentNode;
	this.nextSibling = node.nextSibling;
	this.previousSibling = node.previousSibling;
	this["@@doc-depth"] = depth;
}

Step.prototype.nodeType = 17;

function nodesList(node) {
	var list = [];
	var next = nextNode(node);
	do {
		list.push(next);
		next = next && nextNode(next);
	} while (next);
	return list;
}

// nextNode means:
// descend into firstChild or nextSibling
// if no more siblings, go back up using Step
// if Step, firstChild will be skipped, so nextSibling will be retried
function nextNode(node /* Node */) {
	var type = node.nodeType,
	    depth = node["@@doc-depth"] || 0;
	//index = node["@@doc-index"],
	//indexInParent = 0;
	//if(index === undefined) index = -1;
	//index++;
	if (type != 17 && node.firstChild) {
		// if we can still go down, return firstChild
		node = node.firstChild;
		//indexInParent = node.indexInParent = 0;
		node["@@doc-depth"] = ++depth;
		//node["@@doc-index"] = index;
		return node;
	} else {
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		// FIXME we could also directly return the parent's nextSibling
		if (!node.nextSibling) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			node = node.parentNode;
			if (!node || node["@@doc-depth"] !== depth) return;
			node = new Step(node, depth);
			return node;
		} else {
			// return the next child
			node = node.nextSibling;
			//console.log("found next", inode._name, index);
			node["@@doc-depth"] = depth;
			return node;
		}
	}
}
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vnode = require("./vnode");

Object.defineProperty(exports, "e", {
  enumerable: true,
  get: function () {
    return _vnode.e;
  }
});
Object.defineProperty(exports, "a", {
  enumerable: true,
  get: function () {
    return _vnode.a;
  }
});
Object.defineProperty(exports, "x", {
  enumerable: true,
  get: function () {
    return _vnode.x;
  }
});
Object.defineProperty(exports, "l", {
  enumerable: true,
  get: function () {
    return _vnode.l;
  }
});
Object.defineProperty(exports, "m", {
  enumerable: true,
  get: function () {
    return _vnode.m;
  }
});
Object.defineProperty(exports, "p", {
  enumerable: true,
  get: function () {
    return _vnode.p;
  }
});
Object.defineProperty(exports, "q", {
  enumerable: true,
  get: function () {
    return _vnode.q;
  }
});

var _modify = require("./modify");

Object.defineProperty(exports, "appendChild", {
  enumerable: true,
  get: function () {
    return _modify.appendChild;
  }
});
Object.defineProperty(exports, "insertBefore", {
  enumerable: true,
  get: function () {
    return _modify.insertBefore;
  }
});
Object.defineProperty(exports, "removeChild", {
  enumerable: true,
  get: function () {
    return _modify.removeChild;
  }
});

var _access = require("./access");

Object.defineProperty(exports, "docIter", {
  enumerable: true,
  get: function () {
    return _access.docIter;
  }
});
Object.defineProperty(exports, "nextNode", {
  enumerable: true,
  get: function () {
    return _access.nextNode;
  }
});
Object.defineProperty(exports, "firstChild", {
  enumerable: true,
  get: function () {
    return _access.firstChild;
  }
});
Object.defineProperty(exports, "nextSibling", {
  enumerable: true,
  get: function () {
    return _access.nextSibling;
  }
});
Object.defineProperty(exports, "parent", {
  enumerable: true,
  get: function () {
    return _access.parent;
  }
});
Object.defineProperty(exports, "children", {
  enumerable: true,
  get: function () {
    return _access.children;
  }
});
Object.defineProperty(exports, "childrenByName", {
  enumerable: true,
  get: function () {
    return _access.childrenByName;
  }
});

var _l = require("./l3");

Object.defineProperty(exports, "fromL3", {
  enumerable: true,
  get: function () {
    return _l.fromL3;
  }
});
Object.defineProperty(exports, "toL3", {
  enumerable: true,
  get: function () {
    return _l.toL3;
  }
});

var _render = require("./render");

Object.defineProperty(exports, "render", {
  enumerable: true,
  get: function () {
    return _render.render;
  }
});
exports.compress = compress;
exports.uncompress = uncompress;
},{"./access":1,"./l3":4,"./modify":5,"./render":7,"./vnode":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.str2array = str2array;
exports.array2str = array2str;
exports.convert = convert;
exports.toNative1 = toNative1;
exports.toNative = toNative;
exports.fromNative = fromNative;
exports.toL3 = toL3;
exports.fromL3 = fromL3;

var _vnode = require("./vnode");

var _access = require("./access");

// optional:
//import FastIntCompression from "fastintcompression";

function str2array(str, ar, idx) {
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        //ar.push(str.codePointAt(i));
        ar[idx++] = str.codePointAt(i);
    }
    return idx;
}

function array2str(ar, i) {
    var str = "",
        l = ar.length;
    for (; i < l; i++) {
        str += String.fromCodePoint(ar[i]);
    }
    return str;
}

function convert(v) {
    var i = parseFloat(v);
    if (!isNaN(i)) return i;
    if (v === "true" || v === "false") return v !== "false";
    return v;
}

function toNative1(val) {
    if (val === 1) return false;
    if (val === 2) return true;
    if (val === 3) return 0;
    if (val === 4) return null;
}

function toNative(v, i) {
    if (v.length == 1) return new Float64Array(new Uint32Array([0, v[i]]))[0];
    return new Float64Array(new Uint32Array([v[i], v[i + 1]]))[0];
}

function fromNative(v, arr) {
    var f = new Float64Array(1);
    f[0] = v;
    var i = new Uint32Array(f.buffer);
    if (i[0]) arr.push(i[0]);
    arr.push(i[1]);
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
    var block = 1024 * 1024 * 8;
    var out = new Uint32Array(block),
        names = {},
        i = 0,
        j = 0;
    for (let attr of doc._attrs.entries()) {
        let name = attr[0],
            attrname = "@" + name;
        if (!names[attrname]) {
            names[attrname] = ++j;
            out[i++] = 0;
            out[i++] = 15;
            i = str2array(name, out, i);
        }
        out[i++] = docAttrType(attr[0]);
        i = str2array(attr[0], out, i);
        i = str2array(attr[1], out, i);
    }
    _access.iter(doc, function (node) {
        let type = node.type,
            inode = node.inode,
            depth = inode._depth,
            name = node.name;
        var nameIndex = 0;
        if (typeof name === "string") {
            if (!names[name]) {
                names[name] = ++j;
                out[i++] = 0;
                out[i++] = 15;
                i = str2array(name, out, i);
            }
            nameIndex = names[name];
        }
        out[i++] = 0;
        out[i++] = type;
        out[i++] = depth;
        if (nameIndex) out[i++] = nameIndex;
        if (type == 1) {
            for (let attr of inode._attrs.entries()) {
                let name = attr[0],
                    attrname = "@" + name;
                if (!names[attrname]) {
                    names[attrname] = ++j;
                    out[i++] = 0;
                    out[i++] = 15;
                    i = str2array(name, out, i);
                }
                out[i++] = 0;
                out[i++] = 2;
                out[i++] = names[attrname];
                i = str2array(attr[1], out, i);
            }
        } else if (type == 3) {
            i = str2array(node.value, out, i);
        } else if (type == 12) {
            i = str2array(node.value + "", out, i);
        }
    });
    // remove first 0
    //out.shift();
    return out.subarray(1, i + 1);
}
/*

export function toL3(doc){
   var out = [],
       names = {},
       i = 1;
   for (let attr of doc._attrs.entries()) {
       let name = attr[0], attrname = "@"+name;
       if (!names[attrname]) {
           names[attrname] = i;
           i++;
           out.push(0);
           out.push(15);
           str2array(name,out);
       }
       out.push(docAttrType(attr[0]));
       str2array(attr[0],out);
       str2array(attr[1],out);
   }
   iter(doc, function (node) {
       let type = node.type,
           inode = node.inode,
           depth = inode._depth,
           name = node.name;
       var nameIndex = 0;
       if (typeof name === "string") {
           if(!names[name]) {
               names[name] = i;
               i++;
               out.push(0);
               out.push(15);
               str2array(name,out);
           }
           nameIndex = names[name];
       }
       out.push(0);
       out.push(type);
       out.push(depth);
       if(nameIndex) out.push(nameIndex);
       if (type == 1) {
           for (let attr of inode._attrs.entries()) {
               let name = attr[0], attrname = "@"+name;
               if (!names[attrname]) {
                   names[attrname] = i;
                   i++;
                   out.push(0);
                   out.push(15);
                   str2array(name,out);
               }
               out.push(0);
               out.push(2);
               out.push(names[attrname]);
               str2array(attr[1],out);
           }
       } else if (type == 3) {
           str2array(node.value,out);
       } else if(type == 12){
           str2array(node.value+"",out);
       }
   });
   // remove first 0
   out.shift();
   return out;
}
 */

function fromL3(l3) {
    var names = {},
        n = 0,
        parents = [],
        depth = 0;
    var doc = _vnode.emptyINode(9, "#document", 0, _vnode.emptyAttrMap());
    parents[0] = doc;
    const process = function (entry) {
        let type = entry[0];
        // TODO have attributes accept any type
        if (type == 2) {
            let parent = parents[depth];
            let name = names[entry[1]];
            parent._attrs = parent._attrs.push([name, array2str(entry, 2)]);
        } else if (type == 7 || type == 10) {
            doc._attrs = doc._attrs.push([entry[1], array2str(entry, 2)]);
        } else if (type == 15) {
            n++;
            names[n] = array2str(entry, 1);
        } else if (type != 17) {
            depth = entry[1];
            let parent = parents[depth - 1];
            let parentType = !!parent && parent._type;
            var node, name, valIndex;
            if (type == 1 || type == 5 || type == 6) {
                name = names[entry[2]];
                if (parents[depth]) {
                    if (parents[depth]._attrs) parents[depth]._attrs.endMutation();
                    parents[depth] = parents[depth].endMutation();
                }
                node = _vnode.emptyINode(type, name, depth, _vnode.emptyAttrMap());
                parents[depth] = node;
            } else if (type == 3) {
                if (parentType == 1 || parentType == 9) {
                    name = parent.count();
                    valIndex = 2;
                } else {
                    name = names[entry[2]];
                    valIndex = 3;
                }
                node = new _vnode.Value(type, name, array2str(entry, valIndex), depth);
            } else if (type == 12) {
                if (parentType == 1 || parentType == 9) {
                    name = parent.count();
                    valIndex = 2;
                } else {
                    name = names[entry[2]];
                    valIndex = 3;
                }
                node = new _vnode.Value(type, name, convert(array2str(entry, valIndex)), depth);
            }
            if (parent) parent = parentType == 5 ? parent.push(node) : parentType == 6 ? parent.set(name, node) : parent.push([name, node]);
        }
    };
    var entry = [];
    for (var i = 0, l = l3.length; i < l; i++) {
        if (l3[i] === 0) {
            process(entry);
            entry = [];
        } else {
            entry.push(l3[i]);
        }
    }
    process(entry);
    return parents[0].endMutation();
}
},{"./access":1,"./vnode":10}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.insertChildBefore = insertChildBefore;
exports.removeChild = removeChild;

var _vnode = require('./vnode');

var _access = require('./access');

function appendChild(node, child) {
	node = _vnode.ensureRoot(node);
	//if(!node || !node.size) return;
	//let last = lastChild(node);
	if (node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		// TODO make protective clone (of inode)
		node.inode = _vnode.restoreNode(node.inode.push([child.name, child.inode]), node.inode);
	}
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = _vnode.restoreNode(node.inode.set(child.name, child.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? _access.firstChild(node) : node;
}

function insertChildBefore(node, ins) {
	node = _vnode.ensureRoot(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if (typeof ins.inode == "function") {
		ins.inode(parent, node);
	}
	node = parent;
	while (node.parent) {
		ins = node;
		node = node.parent;
		node.inode = _vnode.restoreNode(node.inode.set(ins.name, ins.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? _access.firstChild(node) : node;
}

function removeChild(node, child) {
	node = _vnode.ensureRoot(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if (child.parent.inode !== node.inode) return;
	let inode = node.inode.removeValue(child.name, child.inode);
	node.inode = _vnode.restoreNode(inode, node.inode);
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = _vnode.restoreNode(node.inode.set(child.name, child.inode), node.inode);
	}
	return node.type == 9 ? _access.firstChild(node) : node;
}
},{"./access":1,"./vnode":10}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.prettyXML = prettyXML;
function prettyXML(text) {
	const shift = ['\n']; // array of shifts
	const step = '  '; // 2 spaces
	const maxdeep = 100; // nesting level

	// initialize array with shifts //
	for (let ix = 0; ix < maxdeep; ix++) {
		shift.push(shift[ix] + step);
	}
	var ar = text.replace(/>\s{0,}</g, "><").replace(/</g, "~::~<").replace(/xmlns\:/g, "~::~xmlns:").replace(/xmlns\=/g, "~::~xmlns=").split('~::~'),
	    len = ar.length,
	    inComment = false,
	    deep = 0,
	    str = '',
	    ix = 0;

	for (ix = 0; ix < len; ix++) {
		// start comment or <![CDATA[...]]> or <!DOCTYPE //
		if (ar[ix].search(/<!/) > -1) {
			str += shift[deep] + ar[ix];
			inComment = true;
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
				inComment = false;
			}
		} else
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
				str += ar[ix];
				inComment = false;
			} else
				// <elm></elm> //
				if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) && /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')) {
					str += ar[ix];
					if (!inComment) deep--;
				} else
					// <elm> //
					if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1) {
						str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
					} else
						// <elm>...</elm> //
						if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
							str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
						} else
							// </elm> //
							if (ar[ix].search(/<\//) > -1) {
								str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
							} else
								// <elm/> //
								if (ar[ix].search(/\/>/) > -1) {
									str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
								} else
									// <? xml ... ?> //
									if (ar[ix].search(/<\?/) > -1) {
										str += shift[deep] + ar[ix];
									} else
										// xmlns //
										if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
											str += shift[deep] + ar[ix];
										} else {
											str += ar[ix];
										}
	}

	return str[0] == '\n' ? str.slice(1) : str;
}
},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.render = render;

var _access = require("./access");

var _dom = require("./dom");

function same(node, vnode) {
	if (node === vnode) return true;
	if (node === undefined || vnode === undefined) return false;
	var inode = vnode.inode;
	if (node.nodeType !== vnode.type) return false;
	if (node["@@doc-depth"] !== inode._depth) return false;
	if (node.nodeValue !== null) {
		if (node.nodeValue !== vnode.value) return false;
	} else {
		if (vnode.value !== undefined) return false;
		if (node.nodeName !== (inode._name + '').toUpperCase()) return false;
		if (node.children.length !== inode.count()) return false;
		if (node.id && inode._attrs.get("id") !== node.id) return false;
		if (node.className && inode._attrs.get("class") !== node.className) return false;
	}
	return true;
}

function render(vnode, root) {
	// fixme stateless
	var parents = [{ domNode: root }];
	const attrFunc = (domNode, v, k) => (domNode.setAttribute(k, v), domNode);
	// ensure paths by calling iter
	var domNodes = _dom.nodesList(root);
	var i = 0;
	var skipDepth = 0,
	    append = false,
	    nextSame = false;
	var handleNode = function (node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		var type = node.type,
		    inode = node.inode,
		    domNode = node.domNode,
		    cur = domNodes[i],
		    next = domNodes[i + 1],
		    nn = _access.nextNode(node);
		var curSame = nextSame || same(cur, node);
		nextSame = same(next, nn);
		if (cur && curSame && nextSame) {
			// skip until next
			// console.log("same",cur,cur["@@doc-depth"],node.name,inode._depth);
			node.domNode = cur;
			skipDepth = cur["@@doc-depth"];
			if (type == 1) parents[inode._depth] = node;
		} else {
			if (cur) {
				if (cur["@@doc-depth"] == inode._depth - 1) {
					//console.log("append",cur);
					append = true;
				} else if (cur["@@doc-depth"] == inode._depth + 1) {
					// console.log("remove",cur);
					// don't remove text, it will be garbage collected
					if (cur.nodeType == 1) cur.parentNode.removeChild(cur);
					// remove from dom, retry this node
					// keep node untill everything is removed
					i++;
					return handleNode(node);
				} else {
					if (type == 1) {
						if (cur.nodeType != 17) cur.parentNode.removeChild(cur);
						// remove from dom, retry this node
						i++;
						return handleNode(node);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if (cur["@@doc-depth"] == skipDepth + 1) {
							cur.nodeValue = node.value;
						} else {
							append = true;
						}
					}
				}
			}
			if (!cur || append) {
				//console.log("empty",type, append)
				if (type == 1) {
					domNode = document.createElement(node.name);
					if (parents[inode._depth - 1]) parents[inode._depth - 1].domNode.appendChild(domNode);
					inode._attrs.reduce(attrFunc, domNode);
					parents[inode._depth] = node;
				} else if (type == 3) {
					domNode = document.createTextNode(node.value);
					parents[inode._depth - 1].domNode.appendChild(domNode);
				}
				node.domNode = domNode;
			}
		}
		if (!append) {
			i++;
		} else {
			append = false;
		}
	};
	_access.iter(vnode, handleNode);
	var l = domNodes.length;
	for (; --l >= i;) {
		var node = domNodes[l];
		if (node.nodeType == 1) node.parentNode.removeChild(node);
	}
}
},{"./access":1,"./dom":2}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LazySeq = LazySeq;
exports.seq = seq;
exports.isSeq = isSeq;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;
function LazySeq(iterable) {
	this.iterable = isSeq(iterable) ? iterable.toArray() : iterable || [];
}

LazySeq.prototype.push = function (v) {
	return this.concat(v);
};

// TODO create seq containing iterator, partially iterated
// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@append"] = LazySeq.prototype.push;

LazySeq.prototype.__is_Seq = true;

LazySeq.prototype.concat = function (...a) {
	var ret = _isArray(this.iterable) ? this.iterable : Array.from(this.iterable);
	for (var i = 0, l = a.length; i < l; i++) {
		var x = a[i];
		if (_isArray(x)) {
			//  assume flat
			ret = ret.concat(x);
		} else if (isSeq(x)) {
			ret = ret.concat(x.toArray());
		} else {
			ret.push(x);
		}
	}
	return new LazySeq(ret);
};

LazySeq.prototype.toString = function () {
	return "[" + this.iterable + "]";
};

LazySeq.prototype.count = function () {
	return this.iterable.length;
};

LazySeq.prototype.toArray = function () {
	return Array.from(this.iterable);
};

Object.defineProperty(LazySeq.prototype, "size", {
	get: function () {
		return this.count();
	}
});

function SeqIterator(iterable) {
	this.iter = _isIter(iterable) ? iterable : iterable[Symbol.iterator]();
}

SeqIterator.prototype["@@append"] = LazySeq.prototype.push;

SeqIterator.prototype["@@empty"] = function () {
	return new LazySeq();
};

const DONE = {
	done: true
};

SeqIterator.prototype.next = function () {
	var v = this.iter.next();
	if (v.done) return DONE;
	return v;
};

SeqIterator.prototype[Symbol.iterator] = function () {
	return this;
};

LazySeq.prototype[Symbol.iterator] = function () {
	return new SeqIterator(this.iterable);
};

function _isArray(a) {
	return !!(a && a.constructor == Array);
}

function _isIter(a) {
	return !!(a && typeof a.next == "function");
}

function seq(...a) {
	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) return x;
		if (_isArray(x) || _isIter(x)) return new LazySeq(x);
	}
	var s = new LazySeq();
	if (a.length === 0) return s;
	return s.concat.apply(s, a);
}

function isSeq(a) {
	return !!(a && a.__is_Seq);
}

const Seq = exports.Seq = LazySeq;

const first = exports.first = s => isSeq(s) ? _isArray(s.iterable) ? s.iterable[0] : _first(s.iterable) : s;

const undef = s => s === undefined || s === null;

function empty(s) {
	return isSeq(s) ? !s.count() : undef(s);
}

function exists(s) {
	return isSeq(s) ? !!s.count() : !undef(s);
}

function count(s) {
	return empty(s) ? 0 : isSeq(s) ? s.count() : undef(s) ? 0 : 1;
}

function insertBefore(s, pos, ins) {
	pos = first(pos);
	pos = pos === 0 ? 1 : pos - 1;
	var a = s.toArray();
	var n = a.slice(0, pos);
	if (isSeq(ins)) {
		n = n.concat(ins.toArray());
	} else {
		n.push(ins);
	}
	return seq(n.concat(a.slice(pos)));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	if ($arg === undefined) return seq();
	if (!isSeq($arg)) return $arg;
	if ($arg.size > 1) return error("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	if ($arg === undefined) return error("FORG0004");
	if (!isSeq($arg)) return $arg;
	if ($arg.size === 0) return error("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	if ($arg === undefined) return error("FORG0005");
	if (!isSeq($arg)) return $arg;
	if ($arg.size != 1) return error("FORG0005");
	return $arg;
}
},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isIterable = isIterable;
exports.compose = compose;
exports.distinctCat$1 = distinctCat$1;
exports.cat = cat;
exports.drop = drop;
exports.take = take;
exports.forEach = forEach;
exports.filter = filter;
exports.distinctCat = distinctCat;
exports.foldLeft = foldLeft;
exports.transform = transform;
exports.into = into;
exports.range = range;

var _seq = require("./seq");

function isIterable(obj) {
    // FIXME is this acceptable?
    return !!obj && typeof obj != "string" && typeof obj[Symbol.iterator] === 'function';
} // very basic stuff, not really transducers but less code


function Singleton(val) {
    this.val = val;
}

Singleton.prototype.next = function () {
    if (this.val !== undefined) {
        var val = this.val;
        this.val = undefined;
        return { value: val };
    }
    return { done: true };
};

function _getIter(iterable) {
    return iterable === undefined ? new Singleton() : isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : new Singleton(iterable);
}

function compose(...funcs) {
    const l = funcs.length;
    return (v, i, iterable, z) => {
        let reset = false,
            c = _append;
        for (var j = 0; j < l; j++) {
            let ret = funcs[j].call(null, v, i, iterable, z);
            if (ret === undefined) {
                reset = true;
                continue;
            }
            // if it's a step, continue processing
            if (ret["@@step"]) {
                v = ret.v;
                z = ret.z;
                c = ret.f;
                if (ret.t == i) return !reset ? step(z, v, c) : z;
            } else {
                // stop processing current iteration
                reset = true;
                z = ret;
            }
        }
        // append at the end
        //return !reset ? step(z, v, c) : z;
        return !reset ? step(z, v, c) : z;
    };
}

// TODO pass control function to the point where a value would be yielded
// use that to control a custom iterator
function _iterate(iterable, f, z) {
    if (z === undefined) z = _new(iterable);
    var i = 0;
    // iterate anything
    var iter = _getIter(iterable);
    let next;
    while (next = iter.next(), !next.done) {
        let v = next.value;
        let ret = f(v, i, iterable, z);
        if (ret !== undefined) {
            if (ret["@@step"]) {
                z = ret.f(ret.z, ret.v);
                if (ret.t == i) return z;
            } else {
                z = ret;
            }
        }
        i++;
    }
    return z;
}

function _new(iterable) {
    return iterable["@@empty"] ? iterable["@@empty"]() : new iterable.constructor();
}

// checkiecheckie
function _append(iterable, appendee) {
    if (iterable["@@append"]) {
        return iterable["@@append"](appendee);
    } else if (iterable.push) {
        let appended = iterable.push(appendee);
        // stateful stuff
        if (appended !== iterable) {
            return iterable;
        }
        return appended;
    } else if (iterable.set) {
        let appended = iterable.set(appendee[0], appendee[1]);
        // stateful stuff
        if (appended !== iterable) {
            return iterable;
        }
        return appended;
    } else {
        return _seq.seq(appendee);
    }
    // badeet badeet bathatsallfolks!
}

// introduce a step so we can reuse _iterate for foldLeft
function step(z, v, f, t, d) {
    // we're going to process this further
    return {
        z: z,
        v: v,
        f: f,
        t: t,
        "@@step": true
    };
}

function _contains(iterable, value, comp) {
    // FIXME how to prevent iteration?
    let iter = _getIter(iterable);
    let next;
    while (next = iter.next(), !next.done) {
        if (next.value === value) return true;
    }
    return false;
}

function distinctCat$1(f) {
    // FIXME how to optimize?
    return function transDistinctCat(v, i, iterable, z) {
        return step(z, v, function (z, v) {
            return foldLeft(v, z, function (z, v) {
                if (f(z, v)) return _append(z, v);
                return z;
            });
        });
    };
}

function cat(v, i, iterable, z) {
    return step(z, v, function (z, v) {
        return foldLeft(v, z, _append);
    });
}

function forEach$1(f) {
    return function transForEach(v, i, iterable, z) {
        return step(z, f(v, i, iterable), _append);
    };
}

function filter$1(f) {
    return function transFilter(v, i, iterable, z) {
        if (f(v, i, iterable)) {
            return step(z, v, _append);
        }
        return z;
    };
}

function foldLeft$1(f, z) {
    return function transFoldLeft(v, i, iterable, z) {
        return f(z, v, i, iterable);
    };
}

function take$1(idx) {
    return function transTake(v, i, iterable, z) {
        if (i < idx) {
            return step(z, v, _append, idx);
        }
        return z;
    };
}

function drop$1(idx) {
    return function transDrop(v, i, iterable, z) {
        if (i >= idx) {
            return step(z, v, _append, -1);
        }
        return z;
    };
}

function drop(iterable, i) {
    if (arguments.length == 1) return drop$1(iterable);
    return _iterate(iterable, drop$1(i), _new(iterable));
}

function take(iterable, i) {
    if (arguments.length == 1) return take$1(iterable);
    return _iterate(iterable, take$1(i), _new(iterable));
}

function forEach(iterable, f) {
    if (arguments.length == 1) return forEach$1(iterable);
    return _iterate(iterable, forEach$1(f), _new(iterable));
}

function filter(iterable, f) {
    if (arguments.length == 1) return filter$1(iterable);
    return _iterate(iterable, filter$1(f), _new(iterable));
}

function distinctCat(iterable, f) {
    if (arguments.length < 2) return distinctCat$1(iterable || _contains);
    return _iterate(iterable, distinctCat$1(f), _new(iterable));
}

// non-composables!
function foldLeft(iterable, z, f) {
    return _iterate(iterable, foldLeft$1(f), z);
}

// FIXME always return a collection, iterate by overriding _append to just return the value
function transform(iterable, f) {
    return _iterate(iterable, f);
}

function into(iterable, f, z) {
    return _iterate(iterable, f, z);
}

function range(n, s = 0) {
    var arr = [];
    for (var i = s; i < n; i++) {
        arr.push(i);
    }
    return _seq.seq(arr);
}

// TODO:
// rewindable/fastforwardable iterators
},{"./seq":8}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.q = undefined;
exports.Value = Value;
exports.VNode = VNode;
exports.vnode = vnode;
exports.VNodeIterator = VNodeIterator;
exports.Step = Step;
exports.emptyINode = emptyINode;
exports.restoreNode = restoreNode;
exports.emptyAttrMap = emptyAttrMap;
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

var _ohamt = require("ohamt");

var ohamt = _interopRequireWildcard(_ohamt);

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _pretty = require("./pretty");

var _transducers = require("./transducers");

var _seq = require("./seq");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function VNode(inode, type, name, value, parent, depth, indexInParent) {
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function () {
	var root = ensureRoot(this);
	return root.inode.toString();
};

VNode.prototype.count = function () {
	return this.inode.count();
};

VNode.prototype.keys = function () {
	return this.inode.keys();
};

VNode.prototype.values = function () {
	return this.inode.values();
};

VNode.prototype.first = function () {
	return this.inode.first();
};

VNode.prototype.last = function () {
	return this.inode.last();
};

VNode.prototype.next = function (node) {
	return this.inode.next(node.name, node.inode);
};

function vnode(inode, parent, depth, indexInParent) {
	return new VNode(inode, inode._type, inode._ns ? q(inode._ns.uri, inode._name) : inode._name, inode._value, parent, depth, indexInParent);
}

function VNodeIterator(iter, parent, f) {
	this.iter = iter;
	this.parent = parent;
	this.f = f;
	this.index = -1;
	this.__is_VNodeIterator = true;
}

const DONE = {
	done: true
};

VNodeIterator.prototype.next = function () {
	var v = this.iter.next();
	this.index++;
	if (v.done) return DONE;
	return { value: this.f(v.value, this.parent, this.index) };
};

// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
VNode.prototype[Symbol.iterator] = function () {
	return new VNodeIterator(this.inode.values(), this, vnode);
};

VNode.prototype.get = function (idx) {
	var val = this.inode.get(idx);
	if (!val) return [];
	val = val.constructor == Array ? val : [val];
	return new VNodeIterator(val[Symbol.iterator](), this, vnode);
};

function Step(inode, parent, depth, indexInParent) {
	this.inode = inode;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this.depth + ", closes:" + this.parent.name + "}";
};

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? rrb.empty.beginMutation() : ohamt.make().beginMutation();
	inode._type = type;
	inode._name = name;
	inode._attrs = attrs;
	inode._ns = ns;
	return inode;
}

function restoreNode(next, node) {
	next._type = node._type;
	next._name = node._name;
	next._attrs = node._attrs;
	next._ns = node._ns;
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

var OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

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
		str += _transducers.into(this, _transducers.forEach(objFunc), []).join(",");
		str += "}";
	} else if (type == 9) {
		str = this._attrs.reduce(docAttrFunc, str);
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

function _modify(pinode, node, ref) {
	var type = pinode._type;
	if (type == 1 || type == 9) {
		if (ref !== undefined) {
			return restoreNode(pinode.insertBefore([ref.name, ref.inode], [node.name, node.inode]), pinode);
		} else {
			// FIXME check the parent type
			return restoreNode(pinode.push([node.name, node.inode]), pinode);
		}
	} else if (type == 5) {
		if (ref !== undefined) {
			return restoreNode(pinode.insertBefore(ref, node.inode), pinode);
		} else {
			return restoreNode(pinode.push(node.inode), pinode);
		}
	} else if (type == 6) {
		return restoreNode(pinode.set(node.name, node.inode), pinode);
	}
}

function _n(type, name, children) {
	if (children === undefined) {
		children = [];
	} else if (_seq.isSeq(children)) {
		children = children.toArray();
	} else if (children.constructor != Array) {
		if (!children.__is_VNode) children = x(children);
		children = [children];
	}
	var node = new VNode(function (parent, ref) {
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
		let inode = emptyINode(type, name, type == 1 ? ohamt.empty.beginMutation() : undefined, ns);
		node.inode = inode;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			child = child.inode(node);
		}
		node.inode = node.inode.endMutation();
		// insert into the parent means: update all parents until we come to the root
		// but the parents of my parent will be updated elsewhere
		// we just mutate the parent, because it was either cloned or newly created
		parent.inode = _modify(pinode, node, ref);
		node.parent = parent;
		return node;
	}, type, name);
	return node;
}

function _a(type, name, value) {
	var node = new VNode(function (parent, ref) {
		let attrMap = parent.inode._attrs;
		if (ref !== undefined) {
			parent.inode._attrs = attrMap.insertBefore([ref.name, ref.value], [name, value]);
		} else {
			parent.inode._attrs = attrMap.push([name, value]);
		}
		node.parent = parent;
		return node;
	}, type, name, value);
	return node;
}

function _v(type, value, name) {
	var node = new VNode(function (parent, ref) {
		let pinode = parent.inode;
		// reuse insertIndex here to create a named map entry
		if (node.name === undefined) node.name = pinode.count() + 1;
		node.inode = new Value(node.type, node.name, value);
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		parent.inode = _modify(pinode, node, ref);
		node.parent = parent;
		return node;
	}, type, name, value);
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
	var attrs = ohamt.empty;
	if (uri) {
		attrs = attrs.set("xmlns" + (prefix ? ":" + prefix : ""), uri);
	}
	if (doctype) {
		attrs = attrs.set("DOCTYPE", doctype);
	}
	return new VNode(emptyINode(9, "#document", 0, attrs), 9, "#document");
}

function ensureRoot(node) {
	if (!node) return;
	if (!node.inode) {
		let root = node.first();
		return vnode(root, vnode(node, undefined, 0), 1);
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
},{"./pretty":6,"./seq":8,"./transducers":9,"ohamt":16,"rrb-vector":14}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.concatRoot = concatRoot;

var _const = require("./const");

var _util = require("./util");

function concatRoot(a, b, mutate) {
	var tuple = _concat(a, b, mutate);
	var a2 = tuple[0],
	    b2 = tuple[1];
	var a2Len = a2.length;
	var b2Len = b2.length;

	if (a2Len === 0) return b2;
	if (b2Len === 0) return a2;

	// Check if both nodes can be crunched together.
	if (a2Len + b2Len <= _const.M) {
		var a2Height = a2.height;
		var a2Sizes = a2.sizes;
		var b2Height = b2.height;
		var b2Sizes = b2.sizes;
		a2 = a2.concat(b2);
		a2.height = a2Height;
		a2.sizes = a2Sizes;
		// Adjust sizes
		if (a2Height > 0) {
			var len = (0, _util.length)(a2);
			for (var i = 0, l = b2Sizes.length; i < l; i++) {
				b2Sizes[i] += len;
			}
			a2.sizes = a2Sizes.concat(b2Sizes);
		}
		return a2;
	}

	if (a2.height > 0) {
		var toRemove = calcToRemove(a, b);
		if (toRemove > _const.E) {
			let tuple = shuffle(a2, b2, toRemove);
			a2 = tuple[0];
			b2 = tuple[1];
		}
	}

	return (0, _util.siblise)(a2, b2);
}

/**
 * Returns an array of two nodes; right and left. One node _may_ be empty.
 * @param {Node} a
 * @param {Node} b
 * @return {Array<Node>}
 * @private
 */
function _concat(a, b, mutate) {
	var aHeight = a.height;
	var bHeight = b.height;

	if (aHeight === 0 && bHeight === 0) {
		return [a, b];
	}

	if (aHeight !== 1 || bHeight !== 1) {
		if (aHeight === bHeight) {
			a = (0, _util.nodeCopy)(a, mutate);
			b = (0, _util.nodeCopy)(b, mutate);
			let tuple = _concat((0, _util.last)(a), (0, _util.first)(b), mutate);
			let a0 = tuple[0];
			let b0 = tuple[1];
			insertRight(a, a0);
			insertLeft(b, b0);
		} else if (aHeight > bHeight) {
			a = (0, _util.nodeCopy)(a, mutate);
			let tuple = _concat((0, _util.last)(a), b, mutate);
			let a0 = tuple[0];
			let b0 = tuple[1];
			insertRight(a, a0);
			b = (0, _util.parentise)(b0, b0.height + 1);
		} else {
			b = (0, _util.nodeCopy)(b, mutate);
			var tuple = _concat(a, (0, _util.first)(b), mutate);
			var left = tuple[0].length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, tuple[left]);
			a = (0, _util.parentise)(tuple[right], tuple[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.length === 0 || b.length === 0) {
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= _const.E) {
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for _concat. Replaces a child node at the side of the parent.
function insertRight(parent, node) {
	var index = parent.length - 1;
	parent[index] = node;
	parent.sizes[index] = (0, _util.length)(node) + (index > 0 ? parent.sizes[index - 1] : 0);
}

function insertLeft(parent, node) {
	var sizes = parent.sizes;

	if (node.length > 0) {
		parent[0] = node;
		sizes[0] = (0, _util.length)(node);

		var len = (0, _util.length)(parent[0]);
		for (let i = 1, l = sizes.length; l > i; i++) {
			sizes[i] = len = len += (0, _util.length)(parent[i]);
		}
	} else {
		parent.shift();
		for (let i = 1, l = sizes.length; l > i; i++) {
			sizes[i] = sizes[i] - sizes[0];
		}
		sizes.shift();
	}
}

/**
 * Returns an array of two balanced nodes.
 * @param {Node} a
 * @param {Node} b
 * @param {number} toRemove
 * @return {Array<Node>}
 */
function shuffle(a, b, toRemove) {
	var newA = allocate(a.height, Math.min(_const.M, a.length + b.length - toRemove));
	var newB = allocate(a.height, Math.max(0, newA.length - (a.length + b.length - toRemove)));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	let aLen = a.length;
	let either, fromA;
	let newALen = newA.length;
	while (fromA = read < aLen, either = fromA ? a[read] : b[read - aLen], either.length % _const.M === 0) {
		let fromNewA = read < newALen;
		if (fromNewA) {
			newA[read] = either;
		} else {
			newB[read - newALen] = either;
		}
		let size = fromNewA ? a.sizes[read] : b.sizes[read - newALen];
		if (!size) {
			size = newA.sizes[read - 1] + (0, _util.length)(either);
		}
		if (fromNewA) {
			newA.sizes[read] = size;
		} else {
			newB.sizes[read - newALen] = size;
		}
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = allocate(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.length > 0 ? 1 : 0) < toRemove && read - a.length < b.length) {
		// Find out the max possible items for copying.
		var source = getEither(a, b, read);
		var to = Math.min(_const.M - slot.length, source.length);

		// Copy and adjust size table.
		var height = slot.height,
		    sizes = height === 0 ? null : slot.sizes.slice(0);
		slot = slot.concat(source.slice(from, to));
		slot.height = height;
		if (slot.height > 0) {
			slot.sizes = sizes;
			var len = sizes.length;
			for (var i = len; i < len + to - from; i++) {
				sizes[i] = (0, _util.length)(slot[i]);
				sizes[i] += i > 0 ? slot.sizes[i - 1] : 0;
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.length <= to) {
			read++;
			from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.length === _const.M) {
			saveSlot(newA, newB, write, slot);
			slot = allocate(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.length > 0) {
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.length + b.length) {
		saveSlot(newA, newB, write, getEither(a, b, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Creates a node or leaf with a given length at their arrays for performance.
// Is only used by shuffle.
function allocate(height, length) {
	var node = new Array(length);
	node.height = height;
	if (height > 0) {
		node.sizes = new Array(length);
	}
	return node;
}

/**
 * helper for setting picking a slot between to nodes
 * @param {Node} aList - a non-leaf node
 * @param {Node} bList - a non-leaf node
 * @param {number} index
 * @param {Node} slot
 */
function saveSlot(aList, bList, index, slot) {
	setEither(aList, bList, index, slot);

	var isInFirst = index === 0 || index === aList.sizes.length;
	var len = isInFirst ? 0 : getEither(aList.sizes, bList.sizes, index - 1);

	setEither(aList.sizes, bList.sizes, index, len + (0, _util.length)(slot));
}

// getEither, setEither and saveSlot are helpers for accessing elements over two arrays.
function getEither(a, b, i) {
	return i < a.length ? a[i] : b[i - a.length];
}

function setEither(a, b, i, value) {
	if (i < a.length) {
		a[i] = value;
	} else {
		b[i - a.length] = value;
	}
}

/**
 * Returns the extra search steps for E. Refer to the paper.
 *
 * @param {Node} a - a non leaf node
 * @param {Node} b - a non leaf node
 * @return {number}
 */
function calcToRemove(a, b) {
	var subLengths = 0;
	subLengths += a.height === 0 ? 0 : sumOfLengths(a);
	subLengths += b.height === 0 ? 0 : sumOfLengths(b);

	return a.length + b.length - (Math.floor((subLengths - 1) / _const.M) + 1);
}

function sumOfLengths(table) {
	var sum = 0;
	var len = table.length;
	for (var i = 0; len > i; i++) sum += table[i].length;
	return sum;
}
},{"./const":12,"./util":15}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const B = exports.B = 5;
const M = exports.M = 1 << B;
const E = exports.E = 2;
},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sliceRoot = sliceRoot;

var _util = require("./util");

function sliceRoot(list, from, to) {
	if (to === undefined) to = (0, _util.length)(list);
	return sliceLeft(from, sliceRight(to, list));
}

function sliceLeft(from, list) {
	if (from === 0) return list;

	// Handle leaf level.
	if ((0, _util.isLeaf)(list)) {
		var node = list.slice(from, list.length + 1);
		node.height = 0;
		return node;
	}

	// Slice the left recursively.
	var left = (0, _util.getSlot)(from, list);
	var sliced = sliceLeft(from - (left > 0 ? list.sizes[left - 1] : 0), list[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === list.length - 1) {
		// elevate!
		return sliced.height < list.height ? (0, _util.parentise)(sliced, list.height) : sliced;
	}

	// Create new node.
	var tbl = list.slice(left, list.length + 1);
	tbl[0] = sliced;
	var sizes = new Array(list.length - left);
	var len = 0;
	for (var i = 0; i < tbl.length; i++) {
		len += (0, _util.length)(tbl[i]);
		sizes[i] = len;
	}
	tbl.height = list.height;
	tbl.sizes = sizes;
	return tbl;
}

function sliceRight(to, list) {
	if (to === (0, _util.length)(list)) return list;

	// Handle leaf level.
	if ((0, _util.isLeaf)(list)) {
		let node = list.slice(0, to);
		node.height = 0;
		return node;
	}

	// Slice the right recursively.
	var right = (0, _util.getSlot)(to, list);
	var sliced = sliceRight(to - (right > 0 ? list.sizes[right - 1] : 0), list[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0) return sliced;

	// Create new node.
	var sizes = list.sizes.slice(0, right);
	var tbl = list.slice(0, right);
	if (sliced.length > 0) {
		tbl[right] = sliced;
		sizes[right] = (0, _util.length)(sliced) + (right > 0 ? sizes[right - 1] : 0);
	}
	tbl.height = list.height;
	tbl.sizes = sizes;
	return tbl;
}
},{"./util":15}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.empty = undefined;
exports.Tree = Tree;
exports.push = push;
exports.get = get;
exports.set = set;
exports.concat = concat;
exports.slice = slice;
exports.toArray = toArray;
exports.fromArray = fromArray;
exports.TreeIterator = TreeIterator;

var _const = require("./const");

var _util = require("./util");

var _concat = require("./concat");

var _slice = require("./slice");

// TODO pvec interop. transients.

const EMPTY_LEAF = [];
EMPTY_LEAF.height = 0;

function Tree(size, root, tail, editable) {
	this.size = size;
	this.root = root;
	this.tail = tail;
	this.editable = editable;
}

const EMPTY = new Tree(0, null, EMPTY_LEAF, false);

const canEditNode = (edit, node) => edit === node.edit;

function push(tree, val) {
	if (tree.tail.length < _const.M) {
		// push to tail
		let newTail = (0, _util.createLeafFrom)(tree.tail, tree.editable);
		newTail.push(val);
		if (!tree.editable) return new Tree(tree.size + 1, tree.root, newTail);
		tree.size++;
		tree.tail = newTail;
		return tree;
	}
	// else push to root if space
	// else create new root
	let newTail = [val];
	newTail.height = 0;
	let newRoot = tree.root ? (0, _util.sinkTailIfSpace)(tree.tail, tree.root, tree.editable) || (0, _util.siblise)(tree.root, (0, _util.parentise)(tree.tail, tree.root.height)) : (0, _util.parentise)(tree.tail, 1);
	if (!tree.editable) return new Tree(tree.size + 1, newRoot, newTail);
	tree.size++;
	tree.root = newRoot;
	tree.tail = newTail;
	return tree;
}

// Gets the value at index i recursively.
function get(tree, i) {
	if (i < 0 || i >= tree.size) {
		return undefined;
	}
	var offset = (0, _util.tailOffset)(tree);
	if (i >= offset) {
		return tree.tail[i - offset];
	}
	return (0, _util.getRoot)(i, tree.root);
}

// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(tree, i, item) {
	var len = tree.size;
	if (i < 0 || len < i) {
		return undefined;
	}
	if (i === len) return push(tree, item);
	var offset = (0, _util.tailOffset)(tree);
	if (i >= offset) {
		var newTail = (0, _util.createLeafFrom)(tree.tail, tree.editable);
		newTail[i - offset] = item;
		if (!tree.editable) return new Tree(tree.size, tree.root, newTail);
		tree.tail = newTail;
		return tree;
	}
	var newRoot = (0, _util.setRoot)(i, item, tree.root, tree.editable);
	if (!tree.editable) return new Tree(tree.size, newRoot, tree.tail);
	tree.root = newRoot;
	return tree;
}

/**
 * join to lists together(concat)
 *
 * @param {Node} a
 * @param {Node} b
 * @return {Node}
 */
function concat(a, b) {
	var aLen = a.size;
	var bLen = b.size;
	var newLen = aLen + bLen;

	if (aLen === 0) return b;
	if (bLen === 0) return a;

	if (!a.root || !b.root) {
		if (aLen + bLen <= _const.M) {
			let newTail = a.tail.concat(b.tail);
			newTail.height = 0;
			if (!a.editable) return new Tree(newLen, null, newTail);
			a.size = newLen;
			a.root = null;
			a.tail = newTail;
			return a;
		}
		if (!a.root && !b.root) {
			// newTail will overflow, but newRoot can't be over M
			let newRoot = a.tail.concat(b.tail.slice(0, _const.M - aLen));
			newRoot.height = 0;
			let newTail = b.tail.slice(_const.M - aLen);
			newTail.height = 0;
			if (!a.editable) return new Tree(newLen, newRoot, newTail);
			a.size = newLen;
			a.root = newRoot;
			a.tail = newTail;
			return a;
		}
		// else either a has a root or b does
		if (!b.root) {
			// b has no root
			let aTailLen = a.tail.length;
			let bTailLen = b.tail.length;
			// size left over in last root node in a
			let rightCut = _const.M - aTailLen;
			// create a new tail by concatting b until cut
			let newTail = a.tail.concat(b.tail.slice(0, rightCut));
			newTail.height = 0;
			let newRoot;
			// if tail would overflow, sink it and make leftover newTail
			if (aTailLen + bTailLen > _const.M) {
				newRoot = (0, _util.sinkTailIfSpace)(newTail, a.root, a.editable);
				newTail = b.tail.slice(rightCut);
				newTail.height = 0;
			} else {
				newRoot = a.root.slice(0);
				if(a.root.height) newRoot.sizes = a.root.sizes.slice(0);
				newRoot.height = a.root.height;
			}
			if (!a.editable) return new Tree(newLen, newRoot, newTail);
			a.size = newLen;
			a.root = newRoot;
			a.tail = newTail;
			return a;
		}
		// else a has no root
		// make a.tail a.root and concat b.root
		let newRoot = (0, _concat.concatRoot)((0, _util.parentise)(a.tail, 1), b.root, a.editable);
		let newTail = (0, _util.createLeafFrom)(b.tail, a.editable);
		if (!a.editable) return new Tree(newLen, newRoot, newTail);
		a.size = newLen;
		a.root = newRoot;
		a.tail = newTail;
		return a;
	} else {
		// both a and b have roots
		// if have a.tail, just sink a.tail and make b.tail new tail...
		let aRoot = a.tail.length === 0 ? a.root : (0, _util.sinkTailIfSpace)(a.tail, a.root, a.editable) || (0, _util.siblise)(a.root, (0, _util.parentise)(a.tail, a.root.height));
		let newRoot = (0, _concat.concatRoot)(aRoot, b.root, a.editable);
		let newTail = (0, _util.createLeafFrom)(b.tail, a.editable);
		if (!a.editable) return new Tree(newLen, newRoot, newTail);
		a.size = newLen;
		a.root = newRoot;
		a.tail = newTail;
		return a;
	}
}

/**
 * return a shallow copy of a portion of a list, with supplied "from" and "to"("to" not included)
 *
 * @param from
 * @param to
 * @param list
 */
function slice(tree, from, to) {
	var max = tree.size;

	if (to === undefined) to = max;

	if (from >= max) {
		return EMPTY;
	}

	if (to > max) {
		to = max;
	}
	//invert negative numbers
	function confine(i) {
		return i < 0 ? i + max : i;
	}
	from = confine(from);
	to = confine(to);
	var offset = (0, _util.tailOffset)(tree);var newRoot, newTail;
	if (from >= offset) {
		newRoot = null;
		newTail = tree.tail.slice(from - offset, to - offset);
	} else if (to <= offset) {
		newRoot = (0, _slice.sliceRoot)(tree.root, from, to);
		newTail = [];
	} else {
		newRoot = (0, _slice.sliceRoot)(tree.root, from, offset);
		newTail = tree.tail.slice(0, to - offset);
	}
	newTail.height = 0;
	return new Tree(to - from, newRoot, newTail);
}

// Converts an array into a list.
function toArray(tree, f) {
	var out = [];
	if (tree.root) {
		_util.rootToArray(tree.root, f, out);
	}
	var tail = tree.tail;
	for(var i = 0, l = tail.length; i<l; i++) {
		out.push(f(tail[i]));
	}
	return out;
}

function fromArray(jsArray) {
	var len = jsArray.length;
	if (len === 0) return EMPTY;
	function _fromArray(jsArray, h, from, to) {
		var step = Math.pow(_const.M, h);
		var len = Math.ceil((to - from) / step);
		var table = new Array(len);
		var lengths = new Array(len);
		for (let i = 0; i < len; i++) {
			//todo: trampoline?
			if (h < 1) {
				break;
			}
			table[i] = _fromArray(jsArray, h - 1, from + i * step, Math.min(from + (i + 1) * step, to));
			lengths[i] = (0, _util.length)(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		table.height = h;
		if (h < 1) {
			for (let i = from; i < to; i++) table[i - from] = jsArray[i];
		} else {
			table.sizes = lengths;
		}
		return table;
	}
	var h = Math.floor(Math.log(len) / Math.log(_const.M));
	var root, tail;
	if (h === 0) {
		tail = (0, _util.createLeafFrom)(jsArray);
		root = null;
	} else {
		tail = [];
		tail.height = 0;
		root = _fromArray(jsArray, h, 0, len);
	}
	return new Tree(len, root, tail, false);
}

exports.empty = EMPTY;


Tree.prototype.push = function (val) {
	return push(this, val);
};

Tree.prototype.pop = function () {
	return slice(this, 0, this.size - 1);
};

Tree.prototype.get = function (i) {
	return get(this, i);
};

Tree.prototype.set = function (i, val) {
	return set(this, i, val);
};

Tree.prototype.concat = function (other) {
	return concat(this, other);
};

Tree.prototype.slice = function (from, to) {
	return slice(this, from, to);
};

Tree.prototype.beginMutation = function () {
	return new Tree(this.size, this.root, this.tail, true);
};

Tree.prototype.endMutation = function () {
	this.editable = false;
	return this;
};

Tree.prototype.count = function () {
	return this.size;
};

Tree.prototype.first = function () {
	return this.get(0);
};

Tree.prototype.next = function (idx) {
	return this.get(idx + 1);
};

Tree.prototype.toJS = function (flat) {
	return toArray(this, flat ? x => x : x => x && x.toJS ? x.toJS() : x);
};

function TreeIterator(tree) {
	this.tree = tree;
	this.i = 0;
}

const DONE = {
	done: true
};

TreeIterator.prototype.next = function () {
	if (this.i == this.tree.size) return DONE;
	var v = this.tree.get(this.i);
	this.i++;
	return { value: v };
};

TreeIterator.prototype[Symbol.iterator] = function () {
	return this;
};

Tree.prototype[Symbol.iterator] = function () {
	return new TreeIterator(this);
};

},{"./concat":11,"./const":12,"./slice":13,"./util":15}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createRoot = createRoot;
exports.nodeCopy = nodeCopy;
exports.createLeafFrom = createLeafFrom;
exports.tailOffset = tailOffset;
exports.sinkTailIfSpace = sinkTailIfSpace;
exports.getRoot = getRoot;
exports.setRoot = setRoot;
exports.parentise = parentise;
exports.siblise = siblise;
exports.last = last;
exports.first = first;
exports.isLeaf = isLeaf;
exports.length = length;
exports.getSlot = getSlot;
exports.rootToArray = rootToArray;

var _const = require("./const");

// Helper functions
function createRoot(tail) {
	let list = [tail];
	list.height = 1;
	list.sizes = [tail.length];
	return list;
}

function nodeCopy(list, mutate) {
	var height = list.height;
	if (height === 0) return createLeafFrom(list);
	if (mutate) return list;
	var sizes = list.sizes.slice(0);
	list = list.slice(0);
	list.height = height;
	list.sizes = sizes;
	return list;
}

function createLeafFrom(list) {
	list = list.slice(0);
	list.height = 0;
	return list;
}

function tailOffset(tree) {
	return tree.root ? length(tree.root) : 0;
}

function sinkTailIfSpace(tail, list, mutate) {
	// Handle resursion stop at leaf level.
	var newA,
	    tailLen = tail.length;
	if (list.height == 1) {
		if (list.length < _const.M) {
			newA = nodeCopy(list, mutate);
			newA.push(tail);
			newA.sizes.push(last(newA.sizes) + tail.length);
			return newA;
		} else {
			return null;
		}
	}

	// Recursively push
	var pushed = sinkTailIfSpace(tail, last(list), mutate);

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null) {
		newA = nodeCopy(list);
		newA[newA.length - 1] = pushed;
		newA.sizes[newA.sizes.length - 1] += tailLen;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (list.length < _const.M) {
		var newSlot = parentise(tail, list.height - 1);
		newA = nodeCopy(list, mutate);
		newA.push(newSlot);
		newA.sizes.push(last(newA.sizes) + length(newSlot));
		return newA;
	} else {
		return null;
	}
}

// Calculates in which slot the item probably is, then
// find the exact slot in the sizes. Returns the index.
function getRoot(i, list) {
	for (var x = list.height; x > 0; x--) {
		var slot = i >> x * _const.B;
		while (list.sizes[slot] <= i) {
			slot++;
		}
		if (slot > 0) {
			i -= list.sizes[slot - 1];
		}
		list = list[slot];
	}
	return list[i];
}

function setRoot(i, item, list, mutate) {
	var len = length(list);
	list = nodeCopy(list, mutate);
	if (isLeaf(list)) {
		list[i] = item;
	} else {
		var slot = getSlot(i, list);
		if (slot > 0) {
			i -= list.sizes[slot - 1];
		}
		list[slot] = setRoot(i, item, list[slot], mutate);
	}
	return list;
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, height) {
	if (height == tree.height) {
		return tree;
	} else {
		var list = [parentise(tree, height - 1)];
		list.height = height;
		list.sizes = [length(tree)];
		return list;
	}
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b) {
	var list = [a, b];
	list.height = a.height + 1;
	list.sizes = [length(a), length(a) + length(b)];
	return list;
}

function last(list) {
	return list[list.length - 1];
}

function first(a) {
	return a[0];
}

// determine if this is a leaf vs container node
function isLeaf(node) {
	return node.height === 0;
}

// get the # of elements in a rrb list
function length(list) {
	return isLeaf(list) ? list.length : last(list.sizes);
}

function getSlot(i, list) {
	var slot = i >> _const.B * list.height;
	while (list.sizes[slot] <= i) {
		slot++;
	}
	return slot;
}

function rootToArray(a, f, out = []) {
	for (var i = 0; i < a.length; i++) {
		if (a.height === 0) {
			out.push(f(a[i]));
		} else {
			rootToArray(a[i], f, out);
		}
	}
	return out;
}

},{"./const":12}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MapIterator = MapIterator;
/**
    @fileOverview Hash Array Mapped Trie.

    Code based on: https://github.com/exclipy/pdata
*/

/* Configuration
 ******************************************************************************/
const SIZE = 5;

const BUCKET_SIZE = Math.pow(2, SIZE);

const MASK = BUCKET_SIZE - 1;

const MAX_INDEX_NODE = BUCKET_SIZE / 2;

const MIN_ARRAY_NODE = BUCKET_SIZE / 4;

/*
 ******************************************************************************/
const nothing = {};

const constant = x => () => x;

/**
    Get 32 bit hash of string.

    Based on:
    http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
*/
const hash = exports.hash = key => {
    if (typeof key === 'number') return key;
    var str = key + '';

    let hash = 0;
    for (let i = 0, len = str.length; i < len; ++i) {
        const c = str.charCodeAt(i);
        hash = (hash << 5) - hash + c | 0;
    }
    return hash;
};

/* Bit Ops
 ******************************************************************************/
/**
    Hamming weight.

    Taken from: http://jsperf.com/hamming-weight
*/
const popcount = v => {
    v -= v >>> 1 & 0x55555555; // works with signed or unsigned shifts
    v = (v & 0x33333333) + (v >>> 2 & 0x33333333);
    return (v + (v >>> 4) & 0xF0F0F0F) * 0x1010101 >>> 24;
};

const hashFragment = (shift, h) => h >>> shift & MASK;

const toBitmap = x => 1 << x;

const fromBitmap = (bitmap, bit) => popcount(bitmap & bit - 1);

/* Array Ops
 ******************************************************************************/
/**
    Set a value in an array.

    @param mutate Should the input array be mutated?
    @param at Index to change.
    @param v New value
    @param arr Array.
*/
const arrayUpdate = (mutate, at, v, arr) => {
    let out = arr;
    if (!mutate) {
        const len = arr.length;
        out = new Array(len);
        for (let i = 0; i < len; ++i) out[i] = arr[i];
    }
    out[at] = v;
    return out;
};

/**
    Remove a value from an array.

    @param mutate Should the input array be mutated?
    @param at Index to remove.
    @param arr Array.
*/
const arraySpliceOut = (mutate, at, arr) => {
    const len = arr.length - 1;
    let i = 0,
        g = 0;
    let out = arr;
    if (mutate) {
        g = i = at;
    } else {
        out = new Array(len);
        while (i < at) out[g++] = arr[i++];
    }
    ++i;
    while (i <= len) out[g++] = arr[i++];
    out.length = len;
    return out;
};

/**
    Insert a value into an array.

    @param mutate Should the input array be mutated?
    @param at Index to insert at.
    @param v Value to insert,
    @param arr Array.
*/
const arraySpliceIn = (mutate, at, v, arr) => {
    const len = arr.length;
    if (mutate) {
        let i = len;
        while (i >= at) arr[i--] = arr[i];
        arr[at] = v;
        return arr;
    }
    let i = 0,
        g = 0;
    const out = new Array(len + 1);
    while (i < at) out[g++] = arr[i++];
    out[at] = v;
    while (i < len) out[++g] = arr[i++];
    return out;
};

/* Node Structures
 ******************************************************************************/
const LEAF = 1;
const COLLISION = 2;
const INDEX = 3;
const ARRAY = 4;
const MULTI = 5;

/**
    Empty node.
*/
const emptyNode = {
    __hamt_isEmpty: true
};

const isEmptyNode = x => x === emptyNode || x && x.__hamt_isEmpty;

/**
    Leaf holding a value.

    @member edit Edit of the node.
    @member hash Hash of key.
    @member key Key.
    @member value Value stored.
*/
const Leaf = (edit, hash, key, value, prev, id, next) => ({
    type: LEAF,
    edit: edit,
    hash: hash,
    key: key,
    value: value,
    prev: prev,
    next: next,
    id: id,
    _modify: Leaf__modify
});

/**
    Leaf holding multiple values with the same hash but different keys.

    @member edit Edit of the node.
    @member hash Hash of key.
    @member children Array of collision children node.
*/
const Collision = (edit, hash, children) => ({
    type: COLLISION,
    edit: edit,
    hash: hash,
    children: children,
    _modify: Collision__modify
});

/**
    Internal node with a sparse set of children.

    Uses a bitmap and array to pack children.

  @member edit Edit of the node.
    @member mask Bitmap that encode the positions of children in the array.
    @member children Array of child nodes.
*/
const IndexedNode = (edit, mask, children) => ({
    type: INDEX,
    edit: edit,
    mask: mask,
    children: children,
    _modify: IndexedNode__modify
});

/**
    Internal node with many children.

    @member edit Edit of the node.
    @member size Number of children.
    @member children Array of child nodes.
*/
const ArrayNode = (edit, size, children) => ({
    type: ARRAY,
    edit: edit,
    size: size,
    children: children,
    _modify: ArrayNode__modify
});

const Multi = (edit, hash, key, children, id) => ({
    type: MULTI,
    edit: edit,
    hash: hash,
    key: key,
    children: children,
    id: id,
    _modify: Multi__modify
});

/**
    Is `node` a leaf node?
*/
const isLeaf = node => node === emptyNode || node.type === LEAF || node.type === COLLISION;

/* Internal node operations.
 ******************************************************************************/
/**
    Expand an indexed node into an array node.

  @param edit Current edit.
    @param frag Index of added child.
    @param child Added child.
    @param mask Index node mask before child added.
    @param subNodes Index node children before child added.
*/
const expand = (edit, frag, child, bitmap, subNodes) => {
    const arr = [];
    let bit = bitmap;
    let count = 0;
    for (let i = 0; bit; ++i) {
        if (bit & 1) arr[i] = subNodes[count++];
        bit >>>= 1;
    }
    arr[frag] = child;
    return ArrayNode(edit, count + 1, arr);
};

/**
    Collapse an array node into a indexed node.

  @param edit Current edit.
    @param count Number of elements in new array.
    @param removed Index of removed element.
    @param elements Array node children before remove.
*/
const pack = (edit, count, removed, elements) => {
    const children = new Array(count - 1);
    let g = 0;
    let bitmap = 0;
    for (let i = 0, len = elements.length; i < len; ++i) {
        if (i !== removed) {
            const elem = elements[i];
            if (elem && !isEmptyNode(elem)) {
                children[g++] = elem;
                bitmap |= 1 << i;
            }
        }
    }
    return IndexedNode(edit, bitmap, children);
};

/**
    Merge two leaf nodes.

    @param shift Current shift.
    @param h1 Node 1 hash.
    @param n1 Node 1.
    @param h2 Node 2 hash.
    @param n2 Node 2.
*/
const mergeLeaves = (edit, shift, h1, n1, h2, n2) => {
    if (h1 === h2) return Collision(edit, h1, [n2, n1]);

    const subH1 = hashFragment(shift, h1);
    const subH2 = hashFragment(shift, h2);
    return IndexedNode(edit, toBitmap(subH1) | toBitmap(subH2), subH1 === subH2 ? [mergeLeaves(edit, shift + SIZE, h1, n1, h2, n2)] : subH1 < subH2 ? [n1, n2] : [n2, n1]);
};

/**
    Update an entry in a collision list.

    @param mutate Should mutation be used?
    @param edit Current edit.
    @param keyEq Key compare function.
    @param hash Hash of collision.
    @param list Collision list.
    @param f Update function.
    @param k Key to update.
    @param size Size ref.
*/
const updateCollisionList = (mutate, edit, keyEq, h, list, f, k, size, insert, multi) => {
    const len = list.length;
    for (let i = 0; i < len; ++i) {
        const child = list[i];
        if (keyEq(k, child.key)) {
            const value = child.value;
            const newValue = f(value);
            if (newValue === value) return list;

            if (newValue === nothing) {
                --size.value;
                return arraySpliceOut(mutate, i, list);
            }
            return arrayUpdate(mutate, i, Leaf(edit, h, k, newValue, insert), list);
        }
    }

    const newValue = f();
    if (newValue === nothing) return list;
    ++size.value;
    return arrayUpdate(mutate, len, Leaf(edit, h, k, newValue, insert), list);
};

const updateMultiList = (mutate, edit, h, list, f, k, size, insert, multi) => {
    var len = list.length;
    var newValue = f();
    if (newValue === nothing) {
        --size.value;
        var idx = len - 1;
        for (; idx >= 0; idx--) if (list[idx].id === multi) break;
        return arraySpliceOut(mutate, idx, list);
    }
    ++size.value;
    return arrayUpdate(mutate, len, Leaf(edit, h, k, newValue, insert, multi), list);
};

const canEditNode = (edit, node) => edit === node.edit;

/* Editing
 ******************************************************************************/
const Leaf__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    var leaf;
    if (keyEq(k, this.key)) {
        let v = f(this.value);
        if (v === nothing) {
            --size.value;
            return emptyNode;
        }
        if (multi) {
            leaf = this;
        } else {
            if (v === this.value) return this;
            if (canEditNode(edit, this)) {
                this.value = v;
                this.prev = insert || this.prev;
                return this;
            }
            return Leaf(edit, h, k, v, insert || this.prev, 0, this.next);
        }
    }
    let v = f();
    if (v === nothing) return this;
    ++size.value;
    if (multi && leaf) {
        //if(v===leaf.value) throw new Error("Either key or value must be unique in a multimap");
        return Multi(edit, h, k, [leaf, Leaf(edit, h, k, v, insert, multi)], multi);
    }
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

const Collision__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    if (h === this.hash) {
        const canEdit = canEditNode(edit, this);
        const list = updateCollisionList(canEdit, edit, keyEq, this.hash, this.children, f, k, size, insert);
        var len = list.length;
        return len > 1 ? canEdit ? this : listCollision(edit, this.hash, list) : len == 1 ? list[0] : // collapse single element collision list
        emptyNode; // nothing to return
    }
    const v = f();
    if (v === nothing) return this;
    ++size.value;
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

const IndexedNode__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    const mask = this.mask;
    const children = this.children;
    const frag = hashFragment(shift, h);
    const bit = toBitmap(frag);
    const indx = fromBitmap(mask, bit);
    const exists = mask & bit;
    const current = exists ? children[indx] : emptyNode;
    const child = current._modify(edit, keyEq, shift + SIZE, f, h, k, size, insert, multi);

    if (current === child) return this;

    const canEdit = canEditNode(edit, this);
    let bitmap = mask;
    let newChildren;
    if (exists && isEmptyNode(child)) {
        // remove
        bitmap &= ~bit;
        if (!bitmap) return emptyNode;
        if (children.length <= 2 && isLeaf(children[indx ^ 1])) return children[indx ^ 1]; // collapse

        newChildren = arraySpliceOut(canEdit, indx, children);
    } else if (!exists && !isEmptyNode(child)) {
        // add
        if (children.length >= MAX_INDEX_NODE) return expand(edit, frag, child, mask, children);

        bitmap |= bit;
        newChildren = arraySpliceIn(canEdit, indx, child, children);
    } else {
        // modify
        newChildren = arrayUpdate(canEdit, indx, child, children);
    }

    if (canEdit) {
        this.mask = bitmap;
        this.children = newChildren;
        return this;
    }
    return IndexedNode(edit, bitmap, newChildren);
};

const ArrayNode__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    let count = this.size;
    const children = this.children;
    const frag = hashFragment(shift, h);
    const child = children[frag];
    const newChild = (child || emptyNode)._modify(edit, keyEq, shift + SIZE, f, h, k, size, insert, multi);

    if (child === newChild) return this;

    const canEdit = canEditNode(edit, this);
    let newChildren;
    if (isEmptyNode(child) && !isEmptyNode(newChild)) {
        // add
        ++count;
        newChildren = arrayUpdate(canEdit, frag, newChild, children);
    } else if (!isEmptyNode(child) && isEmptyNode(newChild)) {
        // remove
        --count;
        if (count <= MIN_ARRAY_NODE) return pack(edit, count, frag, children);
        newChildren = arrayUpdate(canEdit, frag, emptyNode, children);
    } else {
        // modify
        newChildren = arrayUpdate(canEdit, frag, newChild, children);
    }

    if (canEdit) {
        this.size = count;
        this.children = newChildren;
        return this;
    }
    return ArrayNode(edit, count, newChildren);
};

const Multi__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    if (keyEq(k, this.key)) {
        // modify
        const canEdit = canEditNode(edit, this);
        var list = this.children;
        list = updateMultiList(canEdit, edit, h, list, f, k, size, insert, multi);
        if (list.length > 1) return Multi(edit, h, k, list, Math.max(this.id, multi));
        // collapse single element collision list
        return list[0];
    }
    let v = f();
    if (v === nothing) return this;
    ++size.value;
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

emptyNode._modify = (edit, keyEq, shift, f, h, k, size, insert) => {
    const v = f();
    if (v === nothing) return emptyNode;
    ++size.value;
    return Leaf(edit, h, k, v, insert, 0);
};

/* Ordered / Multi helpers
 ******************************************************************************/

function getLeafOrMulti(node, keyEq, hash, key) {
    var s = 0,
        len = 0;
    while (node && node.type > 1) {
        if (node.type == 2) {
            len = node.children.length;
            for (var i = 0; i < len; i++) {
                var c = node.children[i];
                if (keyEq(c.key, key)) {
                    return c;
                }
            }
            return emptyNode;
        } else if (node.type == 3) {
            var frag = hashFragment(s, hash);
            var bit = toBitmap(frag);
            if (node.mask & bit) {
                node = node.children[fromBitmap(node.mask, bit)];
            } else {
                return;
            }
            s += SIZE;
        } else if (node.type == 4) {
            node = node.children[hashFragment(s, hash)];
            s += SIZE;
        } else {
            // just return
            if (keyEq(node.key, key)) {
                return node;
            } else {
                return;
            }
        }
    }
    if (!!node && keyEq(node.key, key)) return node;
}

function getLeafFromMulti(node, id) {
    for (var i = 0, len = node.children.length; i < len; i++) {
        var c = node.children[i];
        if (c.id === id) return c;
    }
}

function getLeafFromMultiV(node, val) {
    for (var i = 0, len = node.children.length; i < len; i++) {
        var c = node.children[i];
        if (c.value === val) return c;
    }
}

/**
 * Set prev/next of leaf deeply (through recursion)
 * @param  {Node}  parent           the branch to update
 * @param  {function}  keyEq        key equality test
 * @param  {function}  edit         mutable flag
 * @param  {Array}  entry           entry tuple to modify
 * @param  {Array}  val             value tuple to set
 * @param  {Boolean} [prev=false]   if true set prev, otherwise set next
 * @param  {Number}  [s=0]          the current height of the branch
 * @return {Node}                 the updated branch
 */
function updatePosition(parent, keyEq, edit, entry, val, prev = false, s = 0) {
    var len = 0,
        type = parent.type,
        node = null,
        idx = 0,
        hash = entry[0],
        key = entry[1],
        id = entry[2];
    if (type == 1) {
        return Leaf(edit, parent.hash, parent.key, parent.value, prev ? val : parent.prev, parent.id, prev ? parent.next : val);
    }
    var children = parent.children;
    if (type == 2) {
        len = children.length;
        for (; idx < len; ++idx) {
            node = children[idx];
            if (keyEq(key, node.key)) break;
        }
    } else if (type == 3) {
        var frag = hashFragment(s, hash);
        var bit = toBitmap(frag);
        if (parent.mask & bit) {
            idx = fromBitmap(parent.mask, bit);
            node = children[idx];
            s += SIZE;
        }
    } else if (type == 4) {
        idx = hashFragment(s, hash);
        node = children[idx];
        s += SIZE;
    } else if (type == 5) {
        // assume not in use
        len = children.length;
        for (; idx < len;) {
            node = children[idx];
            if (node.id === id) break;
            idx++;
        }
    }
    if (node) {
        children = arrayUpdate(canEditNode(edit, node), idx, updatePosition(node, keyEq, edit, entry, val, prev, s), children);
        if (type == 2) {
            return Collision(edit, parent.hash, children);
        } else if (type == 3) {
            return IndexedNode(edit, parent.mask, children);
        } else if (type == 4) {
            return ArrayNode(edit, parent.size, children);
        } else if (type == 5) {
            return Multi(edit, hash, key, children, parent.id);
        }
    }
    return parent;
}

function last(arr) {
    return arr[arr.length - 1];
}

/*
 ******************************************************************************/
function Map(editable, edit, config, root, size, start, insert) {
    this._editable = editable;
    this._edit = edit;
    this._config = config;
    this._root = root;
    this._size = size;
    this._start = start;
    this._insert = insert;
}

Map.prototype.setTree = function (newRoot, newSize, insert) {
    var start = newSize == 1 ? insert : this._start;
    if (this._editable) {
        this._root = newRoot;
        this._size = newSize;
        this._insert = insert;
        this._start = start;
        return this;
    }
    return newRoot === this._root ? this : new Map(this._editable, this._edit, this._config, newRoot, newSize, start, insert);
};

/* Queries
 ******************************************************************************/
/**
    Lookup the value for `key` in `map` using a custom `hash`.

    Returns the value or `alt` if none.
*/
const tryGetHash = exports.tryGetHash = (alt, hash, key, map) => {
    let node = map._root;
    let shift = 0;
    const keyEq = map._config.keyEq;
    while (true) switch (node.type) {
        case LEAF:
            {
                return keyEq(key, node.key) ? node.value : alt;
            }
        case COLLISION:
            {
                if (hash === node.hash) {
                    const children = node.children;
                    for (let i = 0, len = children.length; i < len; ++i) {
                        const child = children[i];
                        if (keyEq(key, child.key)) return child.value;
                    }
                }
                return alt;
            }
        case INDEX:
            {
                const frag = hashFragment(shift, hash);
                const bit = toBitmap(frag);
                if (node.mask & bit) {
                    node = node.children[fromBitmap(node.mask, bit)];
                    shift += SIZE;
                    break;
                }
                return alt;
            }
        case ARRAY:
            {
                node = node.children[hashFragment(shift, hash)];
                if (node) {
                    shift += SIZE;
                    break;
                }
                return alt;
            }
        case MULTI:
            {
                var ret = [];
                for (let i = 0, len = node.children.length; i < len; i++) {
                    var c = node.children[i];
                    ret.push(c.value);
                }
                return ret;
            }
        default:
            return alt;
    }
};

Map.prototype.tryGetHash = function (alt, hash, key) {
    return tryGetHash(alt, hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.

    @see `tryGetHash`
*/
const tryGet = exports.tryGet = (alt, key, map) => tryGetHash(alt, map._config.hash(key), key, map);

Map.prototype.tryGet = function (alt, key) {
    return tryGet(alt, key, this);
};

/**
    Lookup the value for `key` in `map` using a custom `hash`.

    Returns the value or `undefined` if none.
*/
const getHash = exports.getHash = (hash, key, map) => tryGetHash(undefined, hash, key, map);

Map.prototype.getHash = function (hash, key) {
    return getHash(hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.

    @see `get`
*/
const get = exports.get = (key, map) => tryGetHash(undefined, map._config.hash(key), key, map);

Map.prototype.get = function (key, alt) {
    return tryGet(alt, key, this);
};

Map.prototype.first = function () {
    var start = this._start;
    if (!start) return;
    var node = getLeafOrMulti(this._root, this._config.keyEq, start[0], start[1]);
    if (node.type == MULTI) node = getLeafFromMulti(node, start[2]);
    return node && node.value;
};

Map.prototype.last = function () {
    var end = this._insert;
    if (!end) return;
    var node = getLeafOrMulti(this._root, this._config.keyEq, end[0], end[1]);
    if (node.type == MULTI) node = getLeafFromMulti(node, end[2]);
    return node && node.value;
};

Map.prototype.next = function (key, val) {
    var node = getLeafOrMulti(this._root, this._config.keyEq, hash(key), key);
    if (node.type == MULTI) {
        node = getLeafFromMultiV(node, val);
    }
    if (node.next === undefined) return;
    var next = getLeafOrMulti(this._root, this._config.keyEq, node.next[0], node.next[1]);
    if (next.type == MULTI) {
        next = getLeafFromMulti(next, node.next[2]);
    }
    return next && next.value;
};

/**
    Does an entry exist for `key` in `map`? Uses custom `hash`.
*/
const hasHash = exports.hasHash = (hash, key, map) => tryGetHash(nothing, hash, key, map) !== nothing;

Map.prototype.hasHash = function (hash, key) {
    return hasHash(hash, key, this);
};

/**
    Does an entry exist for `key` in `map`? Uses internal hash function.
*/
const has = exports.has = (key, map) => hasHash(map._config.hash(key), key, map);

Map.prototype.has = function (key) {
    return has(key, this);
};

const defKeyCompare = (x, y) => x === y;

/**
    Create an empty map.

    @param config Configuration.
*/
const make = exports.make = config => new Map(0, 0, {
    keyEq: config && config.keyEq || defKeyCompare,
    hash: config && config.hash || hash
}, emptyNode, 0);

/**
    Empty map.
*/
const empty = exports.empty = make();

/**
    Does `map` contain any elements?
*/
const isEmpty = exports.isEmpty = map => map && !!isEmptyNode(map._root);

Map.prototype.isEmpty = function () {
    return isEmpty(this);
};

/* Updates
 ******************************************************************************/
/**
    Alter the value stored for `key` in `map` using function `f` using
    custom hash.

    `f` is invoked with the current value for `k` if it exists,
    or no arguments if no such value exists. `modify` will always either
    update or insert a value into the map.

    Returns a map with the modified value. Does not alter `map`.
*/
const modifyHash = exports.modifyHash = (f, hash, key, insert, multi, map) => {
    const size = { value: map._size };
    const newRoot = map._root._modify(map._editable ? map._edit : NaN, map._config.keyEq, 0, f, hash, key, size, insert, multi);
    return map.setTree(newRoot, size.value, insert || !map._size ? [hash, key, multi] : map._insert);
};

Map.prototype.modifyHash = function (hash, key, f) {
    return modifyHash(f, hash, key, this.has(key), false, this);
};

/**
    Alter the value stored for `key` in `map` using function `f` using
    internal hash function.

    @see `modifyHash`
*/
const modify = exports.modify = (f, key, map) => modifyHash(f, map._config.hash(key), key, map.has(key), false, map);

Map.prototype.modify = function (key, f) {
    return modify(f, key, this);
};

/**
    Store `value` for `key` in `map` using custom `hash`.

    Returns a map with the modified value. Does not alter `map`.
*/
const setHash = exports.setHash = (hash, key, value, map) => appendHash(hash, key, value, map.has(key), map);

Map.prototype.setHash = function (hash, key, value) {
    return setHash(hash, key, value, this);
};

const appendHash = exports.appendHash = function (hash, key, value, exists, map) {
    var insert = map._insert;
    map = modifyHash(constant(value), hash, key, exists ? null : insert, 0, map);
    if (insert && !exists) {
        var keyEq = map._config.keyEq;
        const edit = map._editable ? map._edit : NaN;
        map._root = updatePosition(map._root, keyEq, edit, insert, [hash, key]);
        if (map._start[1] === key) {
            var node = getLeafOrMulti(map._root, keyEq, hash, key);
            var next = node.next;
            map._root = updatePosition(map._root, keyEq, edit, [hash, key], undefined);
            map._root = updatePosition(map._root, keyEq, edit, node.next, undefined, true);
            map._start = node.next;
        }
    }
    return map;
};

Map.prototype.append = function (key, value) {
    return appendHash(hash(key), key, value, false, this);
};

/**
    Store `value` for `key` in `map` using internal hash function.

    @see `setHash`
*/
const set = exports.set = (key, value, map) => setHash(map._config.hash(key), key, value, map);

Map.prototype.set = function (key, value) {
    return set(key, value, this);
};

/**
 * multi-map
 * - create an extra bucket for each entry with same key
 */
const addHash = exports.addHash = function (hash, key, value, map) {
    var insert = map._insert;
    const keyEq = map._config.keyEq;
    var node = getLeafOrMulti(map._root, keyEq, hash, key);
    var multi = node ? node.id + 1 : 0;
    var newmap = modifyHash(constant(value), hash, key, insert, multi, map);
    if (insert) {
        const edit = map._editable ? map._edit : NaN;
        newmap._root = updatePosition(newmap._root, keyEq, edit, insert, [hash, key, multi]);
    }
    return newmap;
};

// single push, like arrays
Map.prototype.push = function (kv) {
    var key = kv[0],
        value = kv[1];
    return addHash(hash(key), key, value, this);
};

/**
    Remove the entry for `key` in `map`.

    Returns a map with the value removed. Does not alter `map`.
*/
const del = constant(nothing);
const removeHash = exports.removeHash = (hash, key, val, map) => {
    // in case of collision, we need a leaf
    const keyEq = map._config.keyEq;
    var node = getLeafOrMulti(map._root, keyEq, hash, key);
    if (node === undefined) return map;
    var prev = node.prev,
        next = node.next;
    var insert = map._insert;
    var leaf;
    if (node.type == MULTI) {
        // default: last will be removed
        leaf = val !== undefined ? getLeafFromMultiV(node, val) : last(node.children);
        prev = leaf.prev;
        next = leaf.next;
    }
    map = modifyHash(del, hash, key, null, leaf ? leaf.id : undefined, map);
    const edit = map._editable ? map._edit : NaN;
    var id = leaf ? leaf.id : 0;
    if (prev !== undefined) {
        map._root = updatePosition(map._root, keyEq, edit, prev, next);
        if (insert && insert[1] === key && insert[2] === id) map._insert = prev;
    }
    if (next !== undefined) {
        map._root = updatePosition(map._root, keyEq, edit, next, prev, true);
        if (map._start[1] === key && map._start[2] === id) {
            //next = node.next;
            map._root = updatePosition(map._root, keyEq, edit, next, undefined, true);
            map._start = next;
        }
    }
    if (next === undefined && prev === undefined) {
        map._insert = map._start = undefined;
    }
    return map;
};

Map.prototype.removeHash = Map.prototype.deleteHash = function (hash, key) {
    return removeHash(hash, key, this);
};

/**
    Remove the entry for `key` in `map` using internal hash function.

    @see `removeHash`
*/
const remove = exports.remove = (key, map) => removeHash(map._config.hash(key), key, undefined, map);

Map.prototype.remove = Map.prototype.delete = function (key) {
    return remove(key, this);
};

// MULTI:
const removeValue = exports.removeValue = (key, val, map) => removeHash(map._config.hash(key), key, val, map);

Map.prototype.removeValue = Map.prototype.deleteValue = function (key, val) {
    return removeValue(key, val, this);
};

const insertBefore = exports.insertBefore = (ref, ins, map) => {
    var rkey = ref[0],
        rval = ref[1],
        rh = hash(rkey);
    const keyEq = map._config.keyEq;
    var refNode = getLeafOrMulti(map._root, keyEq, rh, rkey);
    if (refNode === undefined) return map.push(insert);
    var key = ins[0],
        val = ins[1],
        h = hash(key);
    var node = getLeafOrMulti(map._root, keyEq, h, key);
    var multi = node ? node.id + 1 : 0;
    if (refNode.type == MULTI) {
        refNode = getLeafFromMultiV(refNode, rval);
    }
    var prev = refNode.prev;
    var insert = map._insert;
    map = modifyHash(constant(val), h, key, prev, multi, map);
    const edit = map._editable ? map._edit : NaN;
    // set the refNode's prev to ins' id
    map._root = updatePosition(map._root, keyEq, edit, [rh, rkey, refNode.id], [h, key, multi], true);
    // set the refNode's prev's next to ins' id
    if (prev) {
        map._root = updatePosition(map._root, keyEq, edit, prev, [h, key, multi]);
    } else {
        map._start = [h, key, multi];
    }
    // set the inserted's next to refNode
    map._root = updatePosition(map._root, keyEq, edit, [h, key, multi], [rh, rkey, refNode.id]);
    map._insert = insert;
    return map;
};

Map.prototype.insertBefore = function (ref, ins) {
    return insertBefore(ref, ins, this);
};

Map.prototype.propsByValue = function (key, val) {
    var node = getLeafOrMulti(this._root, this._config.keyEq, hash(key), key);
    if (node.type == MULTI) {
        node = getLeafFromMultiV(val);
    }
    return node && [node.hash, node.key, node.id];
};

/* Mutation
 ******************************************************************************/
/**
    Mark `map` as mutable.
 */
const beginMutation = exports.beginMutation = map => new Map(map._editable + 1, map._edit + 1, map._config, map._root, map._size, map._start, map._insert);

Map.prototype.beginMutation = function () {
    return beginMutation(this);
};

/**
    Mark `map` as immutable.
 */
const endMutation = exports.endMutation = map => {
    map._editable = map._editable && map._editable - 1;
    return map;
};

Map.prototype.endMutation = function () {
    return endMutation(this);
};

/**
    Mutate `map` within the context of `f`.
    @param f
    @param map HAMT
*/
const mutate = exports.mutate = (f, map) => {
    const transient = beginMutation(map);
    f(transient);
    return endMutation(transient);
};

Map.prototype.mutate = function (f) {
    return mutate(f, this);
};

/* Traversal
 ******************************************************************************/
const DONE = {
    done: true
};

function MapIterator(root, config, v, f) {
    this.root = root;
    this.config = config;
    this.f = f;
    this.v = v;
}

MapIterator.prototype.next = function () {
    var v = this.v;
    if (!v) return DONE;
    var node = getLeafOrMulti(this.root, this.config.keyEq, v[0], v[1]);
    if (!node) return DONE;
    if (node.type == MULTI) {
        node = getLeafFromMulti(node, v[2]);
        if (!node) return DONE;
    }
    this.v = node.next;
    return { value: this.f(node) };
};

MapIterator.prototype[Symbol.iterator] = function () {
    return this;
};

/**
    Lazily visit each value in map with function `f`.
*/
const visit = (map, f) => new MapIterator(map._root, map._config, map._start, f);

/**
    Get a Javascsript iterator of `map`.

    Iterates over `[key, value]` arrays.
*/
const buildPairs = x => [x.key, x.value];
const entries = exports.entries = map => visit(map, buildPairs);

Map.prototype.entries = Map.prototype[Symbol.iterator] = function () {
    return entries(this);
};

/**
    Get array of all keys in `map`.

    Order is not guaranteed.
*/
const buildKeys = x => x.key;
const keys = exports.keys = map => visit(map, buildKeys);

Map.prototype.keys = function () {
    return keys(this);
};

/**
    Get array of all values in `map`.

    Order is not guaranteed, duplicates are preserved.
*/
const buildValues = x => x.value;
const values = exports.values = Map.prototype.values = map => visit(map, buildValues);

Map.prototype.values = function () {
    return values(this);
};

/* Fold
 ******************************************************************************/
/**
    Visit every entry in the map, aggregating data.

    Order of nodes is not guaranteed.

    @param f Function mapping accumulated value, value, and key to new value.
    @param z Starting value.
    @param m HAMT
*/
const fold = exports.fold = (f, z, m) => {
    var root = m._root;
    if (isEmptyNode(root)) return z;
    var v = m._start;
    var keyEq = m._config.keyEq;
    var node;
    do {
        node = getLeafOrMulti(root, keyEq, v[0], v[1]);
        v = node.next;
        z = f(z, node.value, node.key);
    } while (node && node.next);
    return z;
};

Map.prototype.fold = Map.prototype.reduce = function (f, z) {
    return fold(f, z, this);
};

/**
    Visit every entry in the map, aggregating data.

    Order of nodes is not guaranteed.

    @param f Function invoked with value and key
    @param map HAMT
*/
const forEach = exports.forEach = (f, map) => fold((_, value, key) => f(value, key, map), null, map);

Map.prototype.forEach = function (f) {
    return forEach(f, this);
};

/* Aggregate
 ******************************************************************************/
/**
    Get the number of entries in `map`.
*/
const count = exports.count = map => map._size;

Map.prototype.count = function () {
    return count(this);
};

Object.defineProperty(Map.prototype, 'size', {
    get: Map.prototype.count
});

/* toMap
 ******************************************************************************/
/**
    Convert to JS object
*/
const toMap = exports.toMap = map => map.fold((acc, v, k) => (acc[k] = v && v.toJS ? v.toJS() : v, acc), {});

Map.prototype.toJS = function () {
    return toMap(this);
};
},{}]},{},[3])(3)
});