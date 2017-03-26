"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.docIter = docIter;
exports.nextNode = nextNode;
exports.prevNode = prevNode;
exports.stringify = stringify;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.children = children;
exports.childrenByName = childrenByName;
exports.getRoot = getRoot;
exports.getDoc = getDoc;
exports.lastNode = lastNode;
exports.parent = parent;
exports.iter = iter;
exports.element = element;
exports.attribute = attribute;
exports.text = text;
exports.child = child;
exports.select = select;
exports.selectAttribute = selectAttribute;

var _vnode = require("./vnode");

var _transducers = require("./transducers");

var _seq = require("./seq");

var _pretty = require("./pretty");

function* docIter(node, reverse = false) {
	node = (0, _vnode.ensureRoot)(node);
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
		node = new _vnode.VNode(inode, inode._type, inode._name, inode._value, parent, indexInParent);
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
				node = new _vnode.VNode(inode, inode._type, inode._name, inode._value, parent, indexInParent);
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
	return (0, _pretty.prettyXML)(str);
}

function firstChild(node, fltr = 0) {
	// FIXME return root if doc (or something else?)
	var next = (0, _vnode.ensureRoot)(node);
	if (!node.inode) return next;
	next = nextNode(next);
	if (node.inode._depth == next.inode._depth - 1) return next;
}

function nextSibling(node) {
	node = (0, _vnode.ensureRoot)(node);
	var parent = node.parent;
	var next = parent.inode.next(node.name, node.inode);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return new _vnode.VNode(next, next._type, next._name, next._value, parent, node.indexInParent + 1);
}

function* children(node) {
	var inode = node;
	var i = 0,
	    iter = inode.values();
	while (!iter.done) {
		let c = iter.next().value;
		yield new _vnode.VNode(c, c.type, c.name, c.value, node, i);
		i++;
	}
}

function childrenByName(node, name) {
	var hasWildcard = /\*/.test(name);
	if (hasWildcard) {
		var regex = new RegExp(name.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		return (0, _transducers.into)(node.inode, (0, _transducers.compose)((0, _transducers.filter)(c => regex.test(c.name), (0, _transducers.forEach)((c, i) => new _vnode.VNode(c, c._type, c._name, c._value, node)))), (0, _seq.seq)());
	} else {
		let entry = node.inode.get(name);
		if (entry === undefined) return (0, _seq.seq)();
		if (entry.constructor == Array) {
			return (0, _transducers.into)(entry, (0, _transducers.forEach)(c => new _vnode.VNode(c, c._type, c._name, c._value, node.inode)), (0, _seq.seq)());
		} else {
			return (0, _seq.toSeq)([new _vnode.VNode(entry, entry._type, entry._name, entry._value, node.inode)]);
		}
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

function lastNode(node) {
	var depth = node.inode._depth;
	if (depth < 0) return node;
	var inode = {};
	var last;
	while (inode._depth != depth) {
		if (node.type < 17) last = node;
		node = nextNode(node);
		if (!node) break;
		inode = node.inode;
	}
	return last;
}

function parent(node) {
	return node.parent;
}

function iter(node, f) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = node => {
		prev = node;
	};
	node = (0, _vnode.ensureRoot)(node);
	f(node, i++);
	while (node) {
		node = nextNode(node);
		if (node) {
			f(node, i++);
		}
	}
	return prev;
}

const _isElement = n => !!n && n.__is_VNode && n.type === 1;

const _isAttribute = n => !!n && n.__is_VNode && n.type === 2;

const _isTextNode = n => !!n && n.__is_VNode && n.type === 3;

function _nodeTest(qname, attr) {
	if (qname === undefined) {
		if (attr) return _transducers.compose.bind(null, (0, _transducers.filter)(n => true));
		return _transducers.compose.bind(null, (0, _transducers.filter)(n => !!n && n[1]._type == 1));
	} else {
		var hasWildcard = /\*/.test(qname);
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			if (attr) return _transducers.compose.bind(null, (0, _transducers.filter)(n => regex.test(n[0])));
			return _transducers.compose.bind(null, (0, _transducers.filter)(n => !!n && n[1]._type == 1 && regex.test(n[0])));
		} else {
			return _transducers.compose.bind(null, (0, _transducers.get)(qname), (0, _transducers.filter)(n => !!n && n[1]._type == 1));
		}
	}
}

function element(qname) {
	return _nodeTest(qname);
}

function attribute(qname) {
	return _nodeTest(qname, true);
}

// FIXME should this be in document order?
function _getTextNodes(n) {
	//if (isSeq(n)) return into(n, compose(filter(_ => _isElement(_)), forEach(_ => _getTextNodes(_), cat)), seq());
	return;
}

function text() {
	return n => _isTextNode(n) && !!n.value;
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
function child(f) {
	return f;
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

function vnode(inode, parent, indexInParent) {
	return new _vnode.VNode(inode, inode._type, inode._name, inode._value, parent, indexInParent);
}

// TODO use direct functions as much as passible, e.g. _isNode instead of node
function _selectImpl(node, path, attr) {
	if (typeof path == "string") {
		var at = /^@/.test(path);
		if (at) path = path.substring(1);
		attr = attr || at;
		path = child(attr ? attribute(path) : element(path));
	}
	const processNode = n => {
		return _isElement(n) ? (0, _transducers.into)(n, path((0, _transducers.forEach)(_ => vnode(_[1], n))), (0, _seq.seq)()) : (0, _seq.seq)();
	};
	const processAttr = n => _isElement(n) ? (0, _transducers.into)(n.inode._attrs, (0, _transducers.compose)(path, (0, _transducers.forEach)(_ => vnode(new _vnode.Value(2, _[0], _[1], n.inode._depth + 1), n))), (0, _seq.seq)()) : (0, _seq.seq)();
	return (0, _seq.isSeq)(node) ? (0, _transducers.transform)(node, (0, _transducers.compose)((0, _transducers.forEach)(attr ? processAttr : processNode), _transducers.cat)) : attr ? processAttr(node) : processNode(node);
}