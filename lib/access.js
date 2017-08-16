"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.last = exports.position = exports.isVNode = undefined;
exports.VNodeIterator = VNodeIterator;
exports.Step = Step;
exports.docIter = docIter;
exports.nextNode = nextNode;
exports.prevNode = prevNode;
exports.stringify = stringify;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.children = children;
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
exports.select2 = select2;
exports.isEmptyNode = isEmptyNode;
exports.name = name;

var _doc = require("./doc");

var _transducers = require("./transducers");

var _seq = require("./seq");

var _pretty = require("./pretty");

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

function Step(inode, name, parent, depth, indexInParent) {
	this.inode = inode;
	this.name = name;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this.depth + ", closes:" + this.parent.name + "}";
};

function* docIter(node) {
	node = _doc.ensureDoc.bind(this)(node);
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
		node = parent.vnode(inode, parent, depth, indexInParent);
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
			node = new Step(inode, node.name, node.parent, depth, node.indexInParent);
			//console.log("found step", node.name, depth, indexInParent);
			return node;
		} else {
			// return the next child
			inode = parent.next(node);
			if (inode !== undefined) {
				node = parent.vnode(inode, parent, depth, indexInParent);
				//console.log("found next", node.name, depth, indexInParent);
				return node;
			}
			throw new Error("Node " + parent.name + " hasn't been completely traversed. Found " + indexInParent + ", contains " + parent.count());
		}
	}
}

function* prevNode(node) {
	//var depth = node.depth;
	while (node) {
		if (!node.size) {
			//depth--;
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
	const attrFunc = (z, kv) => {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	const docAttrFunc = (z, kv) => {
		return z += kv[0] == "DOCTYPE" ? "<!" + kv[0] + " " + kv[1] + ">" : "<?" + kv[0] + " " + kv[1] + "?>";
	};
	for (let node of docIter(input)) {
		let type = node.type;
		if (type == 1) {
			str += "<" + node.name;
			str = _transducers.foldLeft(node.attrEntries(), str, attrFunc);
			if (!node.count()) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			str += _transducers.foldLeft(node.attrEntries(), str, docAttrFunc);
		} else if (type == 17) {
			str += "</" + node.name + ">";
		}
	}
	return _pretty.prettyXML(str);
}

function firstChild(node) {
	// FIXME return root if doc (or something else?)
	var next = _doc.ensureDoc.bind(this)(node);
	if (node !== next) return next;
	// next becomes parent, node = firstChild
	node = next.first();
	if (node) return next.vnode(node, next, next.depth + 1, 0);
}

function nextSibling(node) {
	node = _doc.ensureDoc.bind(this)(node);
	var parent = node.parent;
	var next = parent.next(node);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return parent.vnode(next, parent, node.depth, node.indexInParent + 1);
}

function* children(node) {
	node = _doc.ensureDoc.bind(this)(node);
	var i = 0;
	for (var c of node.values()) {
		if (c) yield node.vnode(c, node, node.depth + 1, i++);
	}
}

function getDoc(node) {
	node = _doc.ensureDoc.bind(this)(node);
	do {
		node = node.parent;
	} while (node.parent);
	return node;
}

function lastChild(node) {
	node = _doc.ensureDoc.bind(this)(node);
	var last = node.last();
	return node.vnode(last, node, node.depth + 1, node.count() - 1);
}

function parent(node) {
	if (!arguments.length) return Axis(parent);
	return node.parent ? _seq.seq(new VNodeIterator([node.parent.inode][Symbol.iterator](), node.parent.parent, node)) : _seq.seq();
}

function self(node) {
	if (!arguments.length) return Axis(self);
	return node ? _seq.seq([node]) : _seq.seq();
}

function iter(node, f) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = node => {
		prev = node;
	};
	node = _doc.ensureDoc.bind(this)(node);
	f(node, i++);
	while (node) {
		node = nextNode(node);
		if (node) {
			f(node, i++);
		}
	}
	return prev;
}

const isVNode = exports.isVNode = n => !!n && n.__is_VNode;

const _isElement = n => isVNode(n) && n.type == 1;

const _isAttribute = n => isVNode(n) && n.type == 2;

const _isText = n => isVNode(n) && n.type == 3;

//const _isList = n => isVNode(n) && n.type == 5;

//const _isMap = n => isVNode(n) && n.type == 6;

const _isLiteral = n => isVNode(n) && n.type == 12;

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
		if (!_seq.isSeq(v) && !isVNode(v)) v = _seq.seq(v);
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
	if (key !== null) {
		var val = node.attr(key);
		if (!val) return [];
		return [[key, val]];
	} else {
		return node.attrEntries();
	}
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
function attribute(qname, node) {
	if (arguments.length < 2) return Axis(attribute.bind(null, qname), 2);
	var hasWildcard = /\*/.test(qname);
	var f = _transducers.forEach(v => node.vnode(node.ivalue(2, v[0], v[1]), node.parent, node.depth + 1, node.indexInParent));
	if (hasWildcard) {
		var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		//		console.log(node)
		f = _transducers.compose(_transducers.filter(n => regex.test(n[0])), f);
	}
	return _transducers.into(_attrGet(node, hasWildcard ? null : qname), f, _seq.seq());
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
	return Axis(x => x);
}

const _isSiblingIterator = n => !!n && n.__is_SiblingIterator;

const isVNodeIterator = n => !!n && n.__is_VNodeIterator;

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
	return { value: this.parent.vnode(v, this.parent, this.depth, this.indexInParent) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
	return this;
};

function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = _doc.ensureDoc.bind(this)(node);
	return _seq.seq(new SiblingIterator(node.inode, node.parent, node.depth, node.indexInParent));
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
	var f = function (node) {
		var has = f._checked.has(node);
		if (!has) f._checked.set(node, true);
		return !has;
	};
	f._checked = new WeakMap();
	return f;
}

function* select2(node, ...paths) {
	// TODO
	// 1: node (or seq) is iterable, so get first as current context
	// 2: each function is a filter (either a node is returned or the process stops)
	// 3: pass each single result to a filter function, yielding a result for each
	var bed = _doc.ensureDoc.bind(this);
	var next = bed(node);
	var cx = next;
	if (next) {
		next = nextNode(next);
		while (next) {
			for (var i = 0, l = paths.length, path = paths[i]; i < l; i++) {
				if (!_seq.isSeq(path)) path = _seq.seq(path);
				// process strings (can this be combined?)
				path = _transducers.transform(path, _transducers.compose(_transducers.forEach(function (path) {
					if (typeof path == "string") {
						var at = /^@/.test(path);
						if (at) path = path.substring(1);
						return at ? attribute(path) : element(path);
					}
					return [path];
				}), _transducers.cat));
				var composed = _transducers.compose.apply(null, path.toArray());
				let ret = composed.call(cx, next);
				if (node) {
					yield ret;
				} else {
					break;
				}
			}
		}
	}
}

// TODO use direct functions as much as passible, e.g. isVNode instead of node
function _selectImpl(node, paths) {
	if (!_seq.isSeq(paths)) paths = _seq.seq(paths);
	var axis = self(),
	    directAccess;
	// process strings (can this be combined?)
	paths = _transducers.forEach(paths, function (path) {
		if (typeof path == "string") {
			var at = /^@/.test(path);
			if (at) path = path.substring(1);
			return at ? attribute(path) : element(path);
		}
		return path;
	});
	var filtered = _transducers.transform(paths, _transducers.compose(_transducers.forEach(function (path) {
		if (path.__is_Axis) {
			axis = path;
		} else if (path.__is_Accessor) {
			directAccess = path.__index;
			return path.f;
		} else {
			return path;
		}
	}), _transducers.filter(_ => !!_))).toArray();
	var bed = _doc.ensureDoc.bind(this);
	var attr = axis.__type == 2;
	const handleDirectAccess = n => {
		return directAccess && !isVNodeIterator(n) && !_isSiblingIterator(n) ? n.get(directAccess) : n;
	};
	if (!attr) filtered.push(_transducers.filter(_comparer()));
	var composed = _transducers.compose.apply(this, filtered);
	const process = n => {
		let list = axis.f(bed(n));
		list = _transducers.into(list, _transducers.forEach(handleDirectAccess), _seq.seq());
		return _transducers.transform(list, composed);
	};
	if (_seq.isSeq(node)) {
		return _transducers.forEach(node, process);
	} else {
		return process(node);
	}
}

function isEmptyNode(node) {
	node = _doc.ensureDoc.bind(this)(node);
	if (!isVNode(node)) return false;
	if (_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.count();
}

function name($a) {
	if (_seq.isSeq($a)) return _transducers.forEach($a, name);
	if (!isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}