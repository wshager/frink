"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isNode = exports.position = undefined;
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
	var depth = inode._depth;
	if (type != 17 && inode.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = node;
		inode = inode.first();
		// TODO handle arrays
		//console.log("found first", inode._name,index);
		node = _vnode.vnode(inode, parent, indexInParent);
		//node.path.push(node);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.inode.count() == indexInParent) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			node = node.parent;
			if (depth === 0 || !node) return;
			inode = node.inode;
			node = new _vnode.Step(inode, node.parent, node.indexInParent);
			//node.path.push(node);
			return node;
		} else {
			// return the next child
			inode = parent.inode.next(inode._name, inode);
			if (inode) {
				//console.log("found next", inode._name, index);
				node = _vnode.vnode(inode, parent, indexInParent);
				//node.path.push(node);
				return node;
			}
			throw new Error("Node " + parent.name + " hasn't been completely traversed. Found " + indexInParent + ", contains " + parent.inode.count());
		}
	}
}

function* prevNode(node) {
	var depth = node._depth;
	while (node) {
		if (!node.size) {
			depth--;
			node = node._parent;
			if (!node) break;
			yield node;
		} else {
			if (!("_index" in node)) node._index = node.size;
			node._index--;
			node = node.getByIndex(node._index);
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
			let inode = node.inode;
			str += "<" + node.name;
			str = inode._attrs.reduce(attrFunc, str);
			if (!inode._size) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			let inode = node.inode;
			str += node._attrs.reduce(docAttrFunc, str);
		} else if (type == 17) {
			let inode = node.inode;
			if (inode._type == 1) str += "</" + inode._name + ">";
		}
	}
	return _pretty.prettyXML(str);
}

function firstChild(node, fltr = 0) {
	// FIXME return root if doc (or something else?)
	var next = _vnode.ensureRoot(node);
	if (!node.inode) return next;
	next = nextNode(next);
	if (node.inode._depth == next.inode._depth - 1) return next;
}

function nextSibling(node) {
	node = _vnode.ensureRoot(node);
	var parent = node.parent;
	var next = parent.inode.next(node.name, node.inode);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return _vnode.vnode(next, parent, node.indexInParent + 1);
}

function* children(node) {
	var inode = node;
	var i = 0,
	    iter = inode.values();
	while (!iter.done) {
		let c = iter.next().value;
		yield _vnode.vnode(c, node, i);
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
	var last = node.inode.last();
	return _vnode.vnode(last, node);
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

const position = exports.position = n => n.indexInParent;

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
		var val = node.inode._attrs.get(key);
		if (!val) return [];
		iter = [[key, val]];
	} else {
		iter = node.inode._attrs;
	}
	return new _vnode.VNodeIterator(iter[Symbol.iterator](), node, (v, parent, index) => _vnode.vnode(new _vnode.Value(2, v[0], v[1], node.inode._depth + 1), parent, index));
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
	return Axis(x => _seq.seq(x));
}

const _isSiblingIterator = n => !!n && n.__is_SiblingIterator;

const _isVNodeIterator = n => !!n && n.__is_VNodeIterator;

function SiblingIterator(inode, parent, index, dir) {
	this.inode = inode;
	this.parent = parent;
	this.index = index;
	this.dir = dir;
	this.__is_SiblingIterator = true;
}

const DONE = {
	done: true
};

SiblingIterator.prototype.next = function () {
	var v = this.dir.call(this.parent.inode, this.inode._name, this.inode);
	this.index++;
	if (!v) return DONE;
	this.inode = v;
	return { value: _vnode.vnode(v, this.parent, this.index) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
	return this;
};

function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = _vnode.ensureRoot(node);
	return _seq.seq(new SiblingIterator(node.inode, node.parent, node.indexInParent, node.inode.next));
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
	if (!_isVNode(node)) return false;
	if (_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.inode.count();
}

const isNode = exports.isNode = _isVNode;

function name($a) {
	if (_seq.isSeq($a)) return _transducers.forEach($a, name);
	if (!_isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}