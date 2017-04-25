(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.amd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isNode = exports.last = exports.position = undefined;
exports.VNodeIterator = VNodeIterator;
exports.Step = Step;
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

var _vnode = require('./vnode');

var _construct = require('./construct');

var _transducers = require('./transducers');

var _seq = require('./seq');

var _pretty = require('./pretty');

function VNodeIterator(iter, parent, f) {
	this.iter = iter;
	this.parent = parent;
	this.f = f;
	this.indexInParent = -1;
	this.__is_VNodeIterator = true;
}

const DONE = {
	done: true
};

VNodeIterator.prototype.next = function () {
	var v = this.iter.next();
	this.indexInParent++;
	if (v.done) return DONE;
	return { value: this.f(v.value, this.parent, this.indexInParent) };
};

// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
_vnode.VNode.prototype[Symbol.iterator] = function () {
	return new VNodeIterator(this.values(), this, _vnode.vnode);
};

_vnode.VNode.prototype.get = function (idx) {
	var val = this._get(idx);
	if (!val) return [];
	val = val.constructor == Array ? val : [val];
	return new VNodeIterator(val[Symbol.iterator](), this, _vnode.vnode);
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

function* docIter(node, reverse = false) {
	node = _construct.ensureRoot(node);
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
			node = new Step(inode, node.parent, depth, node.indexInParent);
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
	var next = _construct.ensureRoot(node);
	if (!node.inode) return next;
	next = nextNode(next);
	if (node.depth == next.depth - 1) return next;
}

function nextSibling(node) {
	node = _construct.ensureRoot(node);
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
	node = _construct.ensureRoot(node);
	var last = node.last();
	return _vnode.vnode(last, node, node.depth + 1);
}

function parent(node) {
	if (!arguments.length) return Axis(parent);
	return node.parent ? _seq.seq(new VNodeIterator([node.parent.inode][Symbol.iterator](), node.parent.parent, _vnode.vnode)) : _seq.seq();
}

function self(node) {
	if (!arguments.length) return Axis(self);
	return node ? _seq.seq(new VNodeIterator([node.inode][Symbol.iterator](), node.parent, _vnode.vnode)) : _seq.seq();
}

function iter(node, f) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = node => {
		prev = node;
	};
	node = _construct.ensureRoot(node);
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
	return new VNodeIterator(iter[Symbol.iterator](), node, (v, parent, index) => _vnode.vnode(new _vnode.Value(2, v[0], v[1], node.depth + 1), parent, index));
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
	return Axis(x => _seq.seq(_construct.ensureRoot(x)));
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
	node = _construct.ensureRoot(node);
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
	node = _construct.ensureRoot(node);
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
},{"./construct":2,"./pretty":8,"./seq":10,"./transducers":11,"./vnode":12}],2:[function(require,module,exports){
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
},{"./seq":10,"./vnode":12}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _construct = require("./construct");

Object.defineProperty(exports, "e", {
  enumerable: true,
  get: function () {
    return _construct.e;
  }
});
Object.defineProperty(exports, "a", {
  enumerable: true,
  get: function () {
    return _construct.a;
  }
});
Object.defineProperty(exports, "x", {
  enumerable: true,
  get: function () {
    return _construct.x;
  }
});
Object.defineProperty(exports, "l", {
  enumerable: true,
  get: function () {
    return _construct.l;
  }
});
Object.defineProperty(exports, "m", {
  enumerable: true,
  get: function () {
    return _construct.m;
  }
});
Object.defineProperty(exports, "p", {
  enumerable: true,
  get: function () {
    return _construct.p;
  }
});
Object.defineProperty(exports, "q", {
  enumerable: true,
  get: function () {
    return _construct.q;
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
},{"./access":1,"./construct":2,"./l3":5,"./modify":6,"./render":9}],5:[function(require,module,exports){
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
},{"./access":1,"./vnode":12}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.insertChildBefore = insertChildBefore;
exports.removeChild = removeChild;

var _construct = require('./construct');

var _access = require('./access');

function _ascend(node) {
	var child;
	while (node.parent) {
		child = node;
		node = node.parent;
		node = node.set(child.name, child.inode);
	}
	// this ensures immutability
	return node.type == 9 ? _access.firstChild(node) : node;
}

function appendChild(node, child) {
	node = _construct.ensureRoot(node);
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
		node = node.push([child.name, child.inode]);
	}
	return _ascend(node);
}

function insertChildBefore(node, ins) {
	node = _construct.ensureRoot(node);
	//if(!node || !node.size) return;
	let parent = node.parent;
	if (typeof ins.inode == "function") {
		ins.inode(parent, node);
	}
	node = parent;
	return _ascend(node);
}

function removeChild(node, child) {
	node = _construct.ensureRoot(node);
	//if(!node || !node.size || !child) return;
	// TODO error
	if (child.parent.inode !== node.inode) return;
	node = node.removeValue(child.name, child.inode);
	return _ascend(node);
}
},{"./access":1,"./construct":2}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = multimap;
function MultiMap() {
	this._buckets = {};
	this._size = 0;
	this.__is_MultiMap = true;
}

MultiMap.prototype.push = function (entry) {
	var key = entry[0];
	var bucket = this._buckets[key];
	entry[2] = this._size++;
	if (bucket && bucket.__is_Bucket) {
		bucket.push(entry);
	} else {
		this._buckets[key] = new Bucket(entry);
	}
	return this;
};

MultiMap.prototype.get = function (key) {
	var bucket = this._buckets[key];
	if (bucket && bucket.__is_Bucket) {
		var vals = bucket._values,
		    len = vals.length;
		if (len === 0) return;
		if (len == 1) return vals[0][1];
		// TODO fix order if needed
		var out = new Array(len);
		for (var i = 0; i < len; i++) out[i] = vals[i][1];
		return out;
	}
};

MultiMap.prototype.keys = function () {
	return Object.keys(this._buckets);
};

function Bucket(val) {
	this._values = [val];
	this.__is_Bucket = true;
}

Bucket.prototype.push = function (val) {
	this._values.push(val);
	return this;
};

function multimap() {
	return new MultiMap();
}
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"./access":1,"./dom":3}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{"./seq":10}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.value = value;
exports.VNode = VNode;
exports.vnode = vnode;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.push = push;
exports.finalize = finalize;
exports.setAttribute = setAttribute;
exports.count = count;
exports.first = first;

var _construct = require("./construct");

var _pretty = require("./pretty");

var _transducers = require("./transducers");

var _multimap = require("./multimap");

var multimap = _interopRequireWildcard(_multimap);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function value(type, name, value) {
	return value;
}

function VNode(inode, type, name, value, parent, depth, indexInParent, cache) {
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.depth = depth | 0;
	this.indexInParent = indexInParent;
	this.cache = cache;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function () {
	var root = _construct.ensureRoot(this);
	return root.inode.toString();
};

VNode.prototype._get = function (idx) {
	if (this.type == 1 || this.type == 9) {
		let keys = this.cache || this.keys();
		return keys[idx];
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
		let children = inode.$children,
		    len = children.length,
		    cache = multimap.default();
		for (let i = 0; i < len; i++) {
			cache.push([children[i].$name || i + 1, children[i]]);
		}
		this.cache = cache;
		return cache.keys();
	}
	if (type == 5) return _transducers.range(inode.length).toArray();
	if (type == 6) {
		let keys = Object.keys(inode);
		this.cache = keys;
		return keys;
	}
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
		var keys = this.cache || this.keys();
		return inode[keys[0]];
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
		var keys = this.cache || this.keys();
		return inode[_last(keys)];
	}
};

VNode.prototype.next = function (node) {
	var type = this.type,
	    inode = this.inode,
	    idx = node.name;
	if (type == 1 || type == 9) {
		if (node.indexInParent) return this.children[node.indexInParent + 1];
	}
	if (type == 5) return inode[idx];
	if (type == 6) {
		var entry = inode[idx];
		return entry;
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
	this.inode.removeValue(key, val);
	return this;
};

function vnode(inode, parent, depth, indexInParent) {
	var type,
	    name,
	    value,
	    cc = inode.constructor;
	if (cc == Array) {
		type = 5;
		name = parent.keys()[indexInParent];
	} else if (cc == Object) {
		if (inode.$name) {
			name = inode.$name;
			type = name == "#document" ? 9 : 1;
		} else {
			type = 6;
			name = parent.keys()[indexInParent];
		}
	} else {
		type = cc == Boolean || cc == Number ? 12 : 3;
		value = inode;
		name = parent.keys()[indexInParent];
	}
	return new VNode(inode, type, inode.$ns ? _construct.q(inode.$ns.uri, name) : name, value, parent, depth, indexInParent);
}

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? [] : {};
	if (type == 1 || type == 9) inode.$name = name;
	inode.$attrs = attrs;
	inode.$ns = ns;
	inode.$children = [];
	return inode;
}

function emptyAttrMap(init) {
	return init || {};
}

function push(inode, val) {
	var cc = inode.constructor;
	if (cc == Array) {
		inode.push(val);
	} else if (cc == Object) {
		if (inode.$name) {
			inode.$children.push(val[1]);
		} else {
			inode[val[0]] = val[1];
		}
	}
	return inode;
}

function finalize(inode) {
	return inode;
}

function setAttribute(inode, key, val) {
	if (inode.$attrs) inode.$attrs[key] = val;
	return inode;
}

function count(inode) {
	var cc = inode.constructor;
	if (cc == Array) {
		return inode.length;
	} else if (cc == Object) {
		if (inode.$name) {
			return inode.$children.length;
		} else {
			return Object.keys(inode).length;
		}
	}
	return 0;
}

function first(inode) {
	var cc = inode.constructor;
	if (cc == Array) {
		return inode[0];
	} else if (cc == Object) {
		if (inode.$name) {
			return inode.$children[0];
		} else {
			return Object.values(inode)[0];
		}
	}
}

function stringify(e, root = true, json = false) {
	var str = "";
	var cc = e.constructor;
	if (cc == Array) {
		str += "[";
		str += _transducers.forEach(e, c => stringify(c, false, json)).join(",");
		str += "]";
	} else if (cc == Object) {
		if (c.$name) {
			str += elemToString(c);
		} else {
			str += "{";
			str += _transducers.forEach(Object.entries(e), c => '"' + c[0] + '":' + stringify(c[1], false, json)).join(",");
			str += "}";
		}
	} else {
		str = e.toString();
	}
	return root && !json ? _pretty.prettyXML(str) : str;
}

function elemToString(e) {
	const attrFunc = (z, kv) => {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	let str = "<" + e.$name;
	let ns = e.$ns;
	if (ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = Object.entries(e.$attrs).reduce(attrFunc, str);
	if (e.$children.length > 0) {
		str += ">";
		for (let c of e.$children) {
			str += stringify(c, false);
		}
		str += "</" + e.$name + ">";
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
},{"./construct":2,"./multimap":7,"./pretty":8,"./transducers":11}]},{},[4])(4)
});