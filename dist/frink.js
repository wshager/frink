(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.amd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
exports.doc = doc;
exports.iter = iter;

var _vnode = require("./vnode");

var _transducers = require("./transducers");

var _seq = require("./seq");

var _pretty = require("./pretty");

function* docIter(node, reverse = false) {
	while (node) {
		if (!node.inode) {
			node = ensureRoot(node);
			yield node;
		} else {
			node = nextNode(node);
			if (node) yield node;
		}
	}
}

function nextNode(node /* VNode */) {
	var type = node.type,
	    inode = node.inode,
	    path = node.path,
	    index = node.index,
	    parent = node.parent,
	    indexInParent = node.indexInParent;
	var depth = inode._depth;
	index++;
	if (path[index]) {
		return path[index];
	}
	if (type != 17 && inode.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = inode;
		inode = inode.first();
		// TODO handle arrays
		//console.log("found first", inode._name,index);
		node = new _vnode.VNode(inode, inode._type, inode._name, inode._value, path, index, parent, indexInParent);
		node.path.push(node);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.count() == indexInParent) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			let i = index;
			while (inode._depth != depth) {
				node = path[--i];
				if (!node) return;
				inode = node.inode;
			}
			node = new _vnode.Step(inode, path, index, node.parent, node.indexInParent);
			node.path.push(node);
			return node;
		} else {
			// return the next child
			inode = parent.next(inode._name, inode, path[index - 1]);
			if (inode) {
				//console.log("found next", inode._name, index);
				node = new _vnode.VNode(inode, inode._type, inode._name, inode._value, path, index, parent, indexInParent);
				node.path.push(node);
				return node;
			}
			throw new Error("Node " + parent._name + " hasn't been completely traversed. Found " + indexInParent + ", contains " + parent.count());
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
	if (!node.inode) return ensureRoot(node);
	var next = nextNode(node);
	if (node.inode._depth == next.inode._depth - 1) return next;
}

/*
export function nextSibling(node){
	// SLOW version, but we have a path+index
	var inode = node.inode,
		path = node.path,
		i = node.index;
	var depth = inode._depth;
	// run down path
	inode = {};
	while(inode._depth != depth) {
		node = nextNode(node);
		if(node.type==17) continue;
		if(!node) break;
		inode = node.inode;
	}
	return node;
}
*/
function nextSibling(node) {
	var pvnode = node.parent,
	    i = node.indexInParent + 1;
	var next = pvnode.next(node.name, node.inode);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return new _vnode.VNode(next, next.type, next.name, node.path, -1, pvnode, i);
}

function* children(node) {
	var inode = node;
	var i = 0,
	    iter = inode.values();
	while (!iter.done) {
		let c = iter.next().value;
		yield new _vnode.VNode(c, c.type, c.name, node.path, -1, inode, i);
		i++;
	}
}

function childrenByName(node, name) {
	var hasWildcard = /\*/.test(name);
	if (hasWildcard) {
		var regex = new RegExp(name.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		var xf = (0, _transducers.compose)((0, _transducers.filter)(c => regex.test(c.name), (0, _transducers.forEach)((c, i) => new _vnode.VNode(c, c._type, c._name, c._value, node.path, -1, node.inode, i))));
		return new _seq.LazySeq((0, _transducers.transform)(node.inode, xf));
	} else {
		let entry = node.inode.get(name);
		if (entry === undefined) return new _seq.LazySeq();
		if (entry.constructor == Array) {
			return new _seq.LazySeq((0, _transducers.forEach)(c => new _vnode.VNode(c, c._type, c._name, c._value, node.path, -1, node.inode)));
		} else {
			return new _seq.LazySeq([new _vnode.VNode(entry, entry._type, entry._name, entry._value, node.path, -1, node.inode)]);
		}
	}
}

function getRoot(node) {
	return node.path[0];
}

function getDoc(node) {
	if (node.index < 0) return node;
	var inode = getRoot(node).parent;
	return new _vnode.VNode(inode, inode._type, inode._name, null, node.path, -1);
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
	// path walking version of parent
	if (!node.inode) return;
	var inode = node.inode,
	    path = node.path,
	    i = node.index - 1;
	var depth = inode._depth - 1;
	// run up path
	while (inode._depth != depth) {
		node = path[i--];
		if (!node || node.parent._type == 9) break;
		if (node.type == 17) continue;
		inode = node.inode;
	}
	return node;
}

function doc(node) {
	while (node.parent) {
		node = node.parent;
	}
	return node;
}

function ensureRoot(node) {
	let root = node.first();
	node = new _vnode.VNode(root, root._type, root._name, root._value, [], 0, node, 0);
	node.path.push(node);
	return node;
}

function iter(node, f) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = node => {
		prev = node;
	};
	while (node) {
		if (!node.inode) {
			node = ensureRoot(node);
			f(node, i++);
		} else {
			node = nextNode(node);
			if (node) {
				f(node, i++);
			}
		}
	}
	return prev;
}
},{"./pretty":6,"./seq":8,"./transducers":9,"./vnode":10}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.nodesList = nodesList;
exports.nextNode = nextNode;
exports.previousNode = previousNode;
function Step(node, depth, index) {
	this.node = node;
	this.nodeName = node.nodeName;
	this.parentNode = node.parentNode;
	this.nextSibling = node.nextSibling;
	this.previousSibling = node.previousSibling;
	this["@@doc-depth"] = depth;
	this["@@doc-index"] = index;
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

function nextNode(node /* Node */) {
	var type = node.nodeType,
	    depth = node["@@doc-depth"] || 0,
	    index = node["@@doc-index"];
	if (index === undefined) index = -1;
	index++;
	if (type != 17 && node.firstChild) {
		// if we can still go down, return firstChild
		depth++;
		node = node.firstChild;
		node["@@doc-depth"] = depth;
		node["@@doc-index"] = index;
		return node;
	} else {
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (!node.nextSibling) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			while (node["@@doc-depth"] != depth) {
				node = node.parentNode;
				if (!node) return;
			}
			node = new Step(node, depth, index);
			return node;
		} else {
			// return the next child
			node = node.nextSibling;
			//console.log("found next", inode._name, index);
			node["@@doc-depth"] = depth;
			node["@@doc-index"] = index;
			return node;
		}
	}
}

function previousNode(node /* Node */) {
	var type = node.nodeType,
	    depth = node["@@doc-depth"],
	    index = node["@@doc-index"];
	//if(index === undefined) index = -1;
	index--;
	if (type != 17 && node.parentNode) {
		// if we can still go down, return firstChild
		depth--;
		node = node.parentNode;
		node["@@doc-depth"] = depth;
		node["@@doc-index"] = index;
		return node;
	} else {
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (!node.previousSibling) {
			//inode = parent;
			depth++;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			while (node["@@doc-depth"] != depth) {
				node = node.firstChild;
				if (!node) return;
			}
			node = new Step(node, depth, index);
			return node;
		} else {
			// return the next child
			node = node.previousSibling;
			//console.log("found next", inode._name, index);
			node["@@doc-depth"] = depth;
			node["@@doc-index"] = index;
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

Object.defineProperty(exports, "elem", {
  enumerable: true,
  get: function () {
    return _vnode.elem;
  }
});
Object.defineProperty(exports, "attr", {
  enumerable: true,
  get: function () {
    return _vnode.attr;
  }
});
Object.defineProperty(exports, "text", {
  enumerable: true,
  get: function () {
    return _vnode.text;
  }
});
Object.defineProperty(exports, "cdata", {
  enumerable: true,
  get: function () {
    return _vnode.cdata;
  }
});
Object.defineProperty(exports, "comment", {
  enumerable: true,
  get: function () {
    return _vnode.comment;
  }
});
Object.defineProperty(exports, "processingInstruction", {
  enumerable: true,
  get: function () {
    return _vnode.processingInstruction;
  }
});
Object.defineProperty(exports, "qname", {
  enumerable: true,
  get: function () {
    return _vnode.qname;
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
},{"./access":1,"./l3":4,"./modify":5,"./render":7,"./vnode":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.toL3 = toL3;
exports.fromL3 = fromL3;

var _fastintcompression = require("fastintcompression");

var _fastintcompression2 = _interopRequireDefault(_fastintcompression);

var _vnode = require("./vnode");

var _access = require("./access");

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
	(0, _access.iter)(doc, function (node) {
		let type = node.type,
		    inode = node.inode,
		    depth = inode._depth,
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
			for (let attr of inode._attrs.entries()) {
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
				out.push(2);
				out.push(names[attrname]);
				out = str2array(attr[1], out);
			}
		} else if (type == 3) {
			out.push(0);
			out.push(type);
			out.push(depth);
			out = str2array(node.value, out);
		} else if (type == 17) {
			out.push(0);
			out.push(type);
			out.push(depth);
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
	var doc = (0, _vnode.emptyINode)(9, "#document", 0, (0, _vnode.emptyAttrMap)());
	parents[0] = doc;
	function process(entry) {
		var type = entry[0];
		switch (type) {
			case 1:
				{
					depth = entry[1];
					let name = names[entry[2]];
					let node = (0, _vnode.emptyINode)(type, name, depth, (0, _vnode.emptyAttrMap)());
					let parent = parents[depth - 1];
					if (parent) parent = parent.push([name, node]);
					parents[depth] = node;
					break;
				}
			case 2:
				{
					let name = names[entry[1]];
					let parent = parents[depth];
					parent._attrs = parent._attrs.push([name, array2str(entry, 2)]);
					break;
				}
			case 3:
				{
					depth = entry[1];
					let parent = parents[depth - 1];
					let name = parent.count();
					let node = new _vnode.Value(type, name, array2str(entry, 2), depth);
					parent = parent.push([name, node]);
					break;
				}
			case 7:
			case 10:
				doc._attrs = doc._attrs.push([entry[1], array2str(entry, 2)]);
				break;
			case 15:
				names[n] = array2str(entry, 1);
				n++;
				break;
			case 17:
				// close
				depth = entry[1];
				parents[depth] = parents[depth].endMutation();
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
	process(entry);
	return parents[0].endMutation();
}
},{"./access":1,"./vnode":10,"fastintcompression":11}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.removeChild = removeChild;

var _vnode = require('./vnode');

var _access = require('./access');

function assertPath(node) {
	if (node.index < 0) return node;
	var lastIndex = node.path.length - 1;
	if (node.index > lastIndex) {
		console.log("Node not in path");
		var last = node.path[lastIndex];
		let next = nextNode(node);
		while (next) {
			next = nextNode(next);
			if (next.inode === node.inode) {
				return next;
			}
		}
	}
	return node;
}

function assertNotInPath(child) {
	var check = assertPath(child);
	if (check) {
		console.log("child exists");
		// TODO clone child
	}
	return child;
}

function appendChild(node, child) {
	// check if path to node is set
	node = assertPath(node);
	let last = (0, _access.lastNode)(node);
	if (node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	let path = last.path.slice(0, last.index + 1);
	node = node.clone();
	node.path = path;
	if (typeof child.inode === "function") {
		child = child.inode(node);
	} else {
		child = assertNotInPath(child);
	}
	// overwrite parent in prevNode
	node.inode = (0, _vnode.restoreNode)(child.parent, node.inode);
	if (node.index < 0) return node;
	node.parent = (0, _vnode.restoreNode)(node.parent.set(node.name, node.inode), node.parent);
	node.path[node.index] = node;
	child = node;
	while (node.inode._depth > 1) {
		// overwrite parent in prevNode
		node = (0, _access.parent)(node).clone();
		node.inode = child.parent;
		node.path = path;
		node.path[node.index] = node;
		node.parent = (0, _vnode.restoreNode)(node.parent.set(node.name, node.inode), node.parent);
		if (node.parent._type == 9) break;
		child = node;
	}
	return node.path[index];
}

function insertBefore(node, elem) {
	node = assertPath(node);
	// find indexInParent
	let index = node.indexInParent;
	// discard path from node down
	let path = node.path.slice(0, node.index + 1);
	node.path = path;
	// create elem from parent
	// pass insertBefore index
	if (typeof elem.inode == "function") elem = elem.inode(node.parent, index);
}

function removeChild(node, child) {
	node = assertPath(node);
	child = assertPath(child);
	let index = node.index;
	// shallow copy up to, but not including, child
	let path = child.path.slice(0, child.index);
	let inode = node.inode.removeValue(child.name, child.inode);
	node = node.clone();
	node.path = path;
	// overwrite parent in prevNode
	node.inode = (0, _vnode.restoreNode)(inode, node.inode);
	if (node.index < 0) return node;
	node.parent = (0, _vnode.restoreNode)(node.parent.set(node.name, node.inode), node.parent);
	node.path[node.index] = node;
	child = node;
	while (node.inode._depth > 1) {
		// overwrite parent in prevNode
		node = (0, _access.parent)(node).clone();
		node.inode = child.parent;
		node.path = path;
		node.path[node.index] = node;
		node.parent = (0, _vnode.restoreNode)(node.parent.set(node.name, node.inode), node.parent);
		if (node.parent._type == 9) break;
		child = node;
	}
	return node.path[index];
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
	var inode = vnode.inode;
	if (node.nodeType !== vnode.type) return false;
	//if (node["@@doc-index"] !== vnode.index) return false;
	if (node["@@doc-depth"] !== inode._depth) return false;
	if (node.nodeName !== (inode._name + '').toUpperCase()) return false;
	return true;
}

function render(vnode, root) {
	// fixme stateless
	var parents = [{ domNode: root }];
	const attrFunc = (domNode, v, k) => (domNode.setAttribute(k, v), domNode);
	// ensure paths by calling iter
	var domNodes = (0, _dom.nodesList)(root);
	var i = 0;
	var skipDepth = 0, append = false;
	var handleNode = function (node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		var type = node.type,
		    inode = node.inode,
		    domNode = node.domNode,
		    prev = domNodes[i];
		if (prev && same(prev, node)) {
			// skip until next
			// console.log("same",prev,prev["@@doc-depth"],node.name,inode._depth);
			node.domNode = prev;
			skipDepth = prev["@@doc-depth"];
			if (type == 1) parents[inode._depth] = node;
		} else {
			if (prev) {
				if (prev["@@doc-depth"] == inode._depth - 1) {
					//console.log("append",prev);
					append = true;
				} else if (prev["@@doc-depth"] == inode._depth + 1) {
					// console.log("remove",prev);
					// don't remove text, it will be garbage collected
					if (prev.nodeType == 1) prev.parentNode.removeChild(prev);
					// remove from dom, retry this node
					// keep node untill everything is removed
					i++;
					return handleNode(node);
				} else {
					if(type == 1){
						if (prev.nodeType != 17) prev.parentNode.removeChild(prev);
						// remove from dom, retry this node
						i++;
						return handleNode(node);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if(prev["@@doc-depth"] == skipDepth + 1){
							prev.nodeValue = node.value;
						} else {
							append = true;
						}
					}
				}
			}
			if(!prev || append){
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
		if(!append) {
			i++;
		} else {
			append = false;
		}
	};
	(0, _access.iter)(vnode, handleNode);
	var l = domNodes.length;
	for (; --l >= i;) {
		var node = domNodes[l];
		if (node.nodeType == 1) node.parentNode.removeChild(node);
	}
}

function createProjection(vnode, projectionOptions = {}) {
	return {
		update: function (updatedVnode) {
			if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
				throw new Error('The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)');
			}
			updateDom(vnode, updatedVnode, projectionOptions);
			vnode = updatedVnode;
		},
		domNode: vnode._domNode
	};
}

function updateDom(previous, vnode, projectionOptions) {
	let domNode = previous.domNode;
	let textUpdated = false;
	if (previous === vnode) {
		return false;
	}
}

function updateDom2(previous, vnode, projectionOptions) {
	let domNode = previous.domNode;
	let textUpdated = false;
	if (previous === vnode) {
		return false; // By contract, VNode objects may not be modified anymore after passing them to maquette
	}
	let updated = false;
	if (vnode.type == 3) {
		if (vnode.value !== previous.value) {
			let newVNode = document.createTextNode(vnode.value);
			domNode.parentNode.replaceChild(newVNode, domNode);
			vnode.domNode = newVNode;
			textUpdated = true;
			return textUpdated;
		}
	} else {
		// FIXME what type?
		if (vnode.vnodeSelector.lastIndexOf('svg', 0) === 0) {// lastIndexOf(needle,0)===0 means StartsWith
			//projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
		}
		if (previous.value !== vnode.value) {
			updated = true;
			if (vnode.value === undefined) {
				domNode.removeChild(domNode.firstChild); // the only textnode presumably
			} else {
				domNode.textContent = vnode.value;
			}
		}
		// FIXME recursion!
		updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions) || updated;
		updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
		if (vnode.properties && vnode.properties.afterUpdate) {
			vnode.properties.afterUpdate.apply(vnode.properties.bind || vnode.properties, [domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]);
		}
	}
	if (updated && vnode.properties && vnode.properties.updateAnimation) {
		//vnode.properties.updateAnimation(domNode, vnode.properties, previous.properties);
	}
	vnode.domNode = previous.domNode;
	return textUpdated;
}

function updateChildren(vnode, domNode, oldChildren, newChildren, projectionOptions) {
	if (oldChildren === newChildren) {
		return false;
	}
	oldChildren = oldChildren || emptyArray;
	newChildren = newChildren || emptyArray;
	let oldChildrenLength = oldChildren.length;
	let newChildrenLength = newChildren.length;
	let transitions = projectionOptions.transitions;

	let oldIndex = 0;
	let newIndex = 0;
	let i;
	let textUpdated = false;
	while (newIndex < newChildrenLength) {
		let oldChild = oldIndex < oldChildrenLength ? oldChildren[oldIndex] : undefined;
		let newChild = newChildren[newIndex];
		if (oldChild !== undefined && same(oldChild, newChild)) {
			// FIXME recursion!
			// same node, so... what? update text just in case?
			textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
			oldIndex++;
		} else {
			let findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
			if (findOldIndex >= 0) {
				// Remove preceding missing children
				for (i = oldIndex; i < findOldIndex; i++) {
					nodeToRemove(oldChildren[i], transitions);
					checkDistinguishable(oldChildren, i, vnode, 'removed');
				}
				// FIXME recusion!
				textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
				oldIndex = findOldIndex + 1;
			} else {
				// New child
				createDom(newChild, domNode, oldIndex < oldChildrenLength ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
				nodeAdded(newChild, transitions);
				checkDistinguishable(newChildren, newIndex, vnode, 'added');
			}
		}
		newIndex++;
	}
	if (oldChildrenLength > oldIndex) {
		// Remove child fragments
		for (i = oldIndex; i < oldChildrenLength; i++) {
			nodeToRemove(oldChildren[i], transitions);
			checkDistinguishable(oldChildren, i, vnode, 'removed');
		}
	}
	return textUpdated;
}

function updateProperties(domNode, previousProperties, properties, projectionOptions) {
	if (!properties) {
		return;
	}
	let propertiesUpdated = false;
	let propNames = Object.keys(properties);
	let propCount = propNames.length;
	for (let i = 0; i < propCount; i++) {
		let propName = propNames[i];
		// assuming that properties will be nullified instead of missing is by design
		let propValue = properties[propName];
		let previousValue = previousProperties[propName];
		if (propName === 'class') {
			if (previousValue !== propValue) {
				throw new Error('"class" property may not be updated. Use the "classes" property for conditional css classes.');
			}
		} else if (propName === 'classes') {
			let classList = domNode.classList;
			let classNames = Object.keys(propValue);
			let classNameCount = classNames.length;
			for (let j = 0; j < classNameCount; j++) {
				let className = classNames[j];
				let on = !!propValue[className];
				let previousOn = !!previousValue[className];
				if (on === previousOn) {
					continue;
				}
				propertiesUpdated = true;
				if (on) {
					classList.add(className);
				} else {
					classList.remove(className);
				}
			}
		} else if (propName === 'styles') {
			let styleNames = Object.keys(propValue);
			let styleCount = styleNames.length;
			for (let j = 0; j < styleCount; j++) {
				let styleName = styleNames[j];
				let newStyleValue = propValue[styleName];
				let oldStyleValue = previousValue[styleName];
				if (newStyleValue === oldStyleValue) {
					continue;
				}
				propertiesUpdated = true;
				if (newStyleValue) {
					checkStyleValue(newStyleValue);
					projectionOptions.styleApplyer(domNode, styleName, newStyleValue);
				} else {
					projectionOptions.styleApplyer(domNode, styleName, '');
				}
			}
		} else {
			if (!propValue && typeof previousValue === 'string') {
				propValue = '';
			}
			if (propName === 'value') {
				// value can be manipulated by the user directly and using event.preventDefault() is not an option
				if (domNode[propName] !== propValue && domNode['oninput-value'] && domNode['oninput-value'] !== propValue) {
					domNode[propName] = propValue; // Reset the value, even if the virtual DOM did not change
					domNode['oninput-value'] = undefined;
				} // else do not update the domNode, otherwise the cursor position would be changed
				if (propValue !== previousValue) {
					propertiesUpdated = true;
				}
			} else if (propValue !== previousValue) {
				let type = typeof propValue;
				if (type === 'function') {
					throw new Error('Functions may not be updated on subsequent renders (property: ' + propName + '). Hint: declare event handler functions outside the render() function.');
				}
				if (type === 'string' && propName !== 'innerHTML') {
					if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
						domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
					} else if (propName === 'role' && propValue === '') {
						domNode.removeAttribute(propName);
					} else {
						domNode.setAttribute(propName, propValue);
					}
				} else {
					if (domNode[propName] !== propValue) {
						// Comparison is here for side-effects in Edge with scrollLeft and scrollTop
						domNode[propName] = propValue;
					}
				}
				propertiesUpdated = true;
			}
		}
	}
	return propertiesUpdated;
}

function createDom(vnode, parentNode, insertBefore, projectionOptions) {
	let domNode,
	    i,
	    c,
	    start = 0,
	    type,
	    found;
	let vnodeSelector = vnode.vnodeSelector;
	if (vnodeSelector === '') {
		domNode = vnode.domNode = document.createTextNode(vnode.text);
		if (insertBefore !== undefined) {
			parentNode.insertBefore(domNode, insertBefore);
		} else {
			parentNode.appendChild(domNode);
		}
	} else {
		// parse selector
		for (i = 0; i <= vnodeSelector.length; ++i) {
			c = vnodeSelector.charAt(i);
			// if EOS or selector found
			if (i === vnodeSelector.length || c === '.' || c === '#') {
				type = vnodeSelector.charAt(start - 1);
				found = vnodeSelector.slice(start, i);
				if (type === '.') {
					domNode.classList.add(found);
				} else if (type === '#') {
					domNode.id = found;
				} else {
					if (found === 'svg') {
						projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
					}
					if (projectionOptions.namespace !== undefined) {
						domNode = vnode.domNode = document.createElementNS(projectionOptions.namespace, found);
					} else {
						domNode = vnode.domNode = document.createElement(found);
						if (found === 'input' && vnode.properties && vnode.properties.type !== undefined) {
							// IE8 and older don't support setting input type after the DOM Node has been added to the document
							domNode.setAttribute("type", vnode.properties.type);
						}
					}
					if (insertBefore !== undefined) {
						parentNode.insertBefore(domNode, insertBefore);
					} else {
						parentNode.appendChild(domNode);
					}
				}
				start = i + 1;
			}
		}
		initPropertiesAndChildren(domNode, vnode, projectionOptions);
	}
}

function initPropertiesAndChildren(domNode, vnode, projectionOptions) {
	addChildren(domNode, vnode.children, projectionOptions); // children before properties, needed for value property of <select>.
	if (vnode.text) {
		domNode.textContent = vnode.text;
	}
	setProperties(domNode, vnode.properties, projectionOptions);
	if (vnode.properties && vnode.properties.afterCreate) {
		vnode.properties.afterCreate.apply(vnode.properties.bind || vnode.properties, [domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]);
	}
}

function addChildren(domNode, children, projectionOptions) {
	if (!children) {
		return;
	}
	for (let i = 0; i < children.length; i++) {
		createDom(children[i], domNode, undefined, projectionOptions);
	}
}

function setProperties(domNode, properties, projectionOptions) {
	if (!properties) {
		return;
	}
	let eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
	let propNames = Object.keys(properties);
	let propCount = propNames.length;
	for (let i = 0; i < propCount; i++) {
		let propName = propNames[i];
		let propValue = properties[propName];
		if (propName === 'className') {
			throw new Error('Property "className" is not supported, use "class".');
		} else if (propName === 'class') {
			propValue.split(/\s+/).forEach(token => domNode.classList.add(token));
		} else if (propName === 'classes') {
			// object with string keys and boolean values
			let classNames = Object.keys(propValue);
			let classNameCount = classNames.length;
			for (let j = 0; j < classNameCount; j++) {
				let className = classNames[j];
				if (propValue[className]) {
					domNode.classList.add(className);
				}
			}
		} else if (propName === 'styles') {
			// object with string keys and string (!) values
			let styleNames = Object.keys(propValue);
			let styleCount = styleNames.length;
			for (let j = 0; j < styleCount; j++) {
				let styleName = styleNames[j];
				let styleValue = propValue[styleName];
				if (styleValue) {
					checkStyleValue(styleValue);
					projectionOptions.styleApplyer(domNode, styleName, styleValue);
				}
			}
		} else if (propName !== 'key' && propValue !== null && propValue !== undefined) {
			let type = typeof propValue;
			if (type === 'function') {
				if (propName.lastIndexOf('on', 0) === 0) {
					// lastIndexOf(,0)===0 -> startsWith
					if (eventHandlerInterceptor) {
						propValue = eventHandlerInterceptor(propName, propValue, domNode, properties); // intercept eventhandlers
					}
					if (propName === 'oninput') {
						(function () {
							// record the evt.target.value, because IE and Edge sometimes do a requestAnimationFrame between changing value and running oninput
							let oldPropValue = propValue;
							propValue = function (_this /*HTMLElement*/, evt /*Event*/) {
								evt.target['oninput-value'] = evt.target /*as HTMLInputElement*/.value; // may be HTMLTextAreaElement as well
								oldPropValue.apply(_this, [evt]);
							};
						})();
					}
					domNode[propName] = propValue;
				}
			} else if (type === 'string' && propName !== 'value' && propName !== 'innerHTML') {
				if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
					domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
				} else {
					domNode.setAttribute(propName, propValue);
				}
			} else {
				domNode[propName] = propValue;
			}
		}
	}
}

function nodeToRemove(vNode, transitions) {
	let domNode = vNode.domNode;
	if (vNode.properties) {
		let exitAnimation = vNode.properties.exitAnimation;
		if (exitAnimation) {
			domNode.style.pointerEvents = 'none';
			let removeDomNode = function () {
				if (domNode.parentNode) {
					domNode.parentNode.removeChild(domNode);
				}
			};
			if (typeof exitAnimation === 'function') {
				exitAnimation(domNode, removeDomNode, vNode.properties);
				return;
			} else {
				transitions.exit(vNode.domNode, vNode.properties, exitAnimation, removeDomNode);
				return;
			}
		}
	}
	if (domNode.parentNode) {
		domNode.parentNode.removeChild(domNode);
	}
}
},{"./access":1,"./dom":2}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LazySeq = LazySeq;
function LazySeq(iterable) {
	this.iterable = iterable || [];
}

LazySeq.prototype.push = function (v) {
	return this.concat(v);
};

// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@append"] = LazySeq.prototype.push;

LazySeq.prototype.concat = function (...v) {
	return new LazySeq(this.iterable.concat(v));
};

LazySeq.prototype.get = function (index) {
	var i = 0;
	var iterable = this.iterable;
	var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : {
		next: function () {
			return { value: iterable, done: true };
		}
	};
	var next = iter.next();
	this.iterable = [];
	while (!next.done) {
		var v = next.value;
		this.iterable.push(v);
		if (i === index) {
			this.rest = iter;
			return v;
		}
		next = iter.next();
	}
};

LazySeq.prototype.toString = function () {
	return "[" + this.iterable + "]";
};
},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isIterable = isIterable;
exports.compose = compose;
exports.forEach$1 = forEach$1;
exports.filter$1 = filter$1;
exports.foldLeft$1 = foldLeft$1;
exports.forEach = forEach;
exports.filter = filter;
exports.foldLeft = foldLeft;
exports.transform = transform;
exports.into = into;
// very basic stuff, not really transducers but less code

function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === 'function';
}

function compose(...funcs) {
  const l = funcs.length;
  return (v, i, iterable, z) => {
    for (var j = l; --j >= 0;) {
      let ret = funcs[j].call(null, v, i, iterable, z);
      // if it's a step, continue processing
      if (ret["@@step"]) {
        v = ret.v;
        z = ret.z;
      } else {
        z = ret;
      }
    }
    // append at the end
    return _append(z, v);
  };
}

/*
function _iterate(wrapped, z) {
  return function (iterable) {
    if (z === undefined) z = _new(iterable);
    var i = 0;
    // iterate anything
    var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
      next: function () {
        return { value: iterable, done: true };
      }
    };
    let next;
    while (next = iter.next(), !next.done) {
      let v = next.value;
      let ret = wrapped(v, i, iterable, z);
      if(ret["@@step"]) {
          z = _append(ret.z,ret.v);
      } else {
          z = ret;
      }
      //yield z;
      i++;
    }
    return z;
  };
}
*/
function _iterate(iterable, f, z) {
  if (z === undefined) z = _new(iterable);
  var i = 0;
  // iterate anything
  var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
    next: function () {
      return { value: iterable, done: true };
    }
  };
  let next;
  while (next = iter.next(), !next.done) {
    let v = next.value;
    let ret = f(v, i, iterable, z);
    if (ret["@@step"]) {
      z = _append(ret.z, ret.v);
    } else {
      z = ret;
    }
    i++;
  }
  return z;
}

function _new(iterable) {
  return iterable.hasOwnProperty("@@empty") ? iterable["@@empty"]() : new iterable.constructor();
}

// memoized
function _append(iterable, appendee) {
  try {
    return iterable["@@append"](appendee);
  } catch (e) {
    try {
      let appended = iterable.push(appendee);
      // stateful stuff
      if (appended !== iterable) {
        iterable["@@append"] = appendee => {
          this.push(appendee);
          return this;
        };
        return iterable;
      }
      iterable["@@append"] = appendee => {
        return this.push(appendee);
      };
      return appended;
    } catch (e) {
      let appended = iterable.set(appendee[0], appendee[1]);
      // stateful stuff
      if (appended === iterable) {
        iterable["@@append"] = appendee => {
          this.set(appendee[0], appendee[1]);
          return this;
        };
        return iterable;
      }
      iterable["@@append"] = appendee => {
        return this.set(appendee[0], appendee[1]);
      };
      return appended;
      // badeet badeet bathatsallfolks!
      // if you want more generics, use a library
    }
  }
}

function step(z, v) {
  // we're going to process this further
  return {
    z: z,
    v: v,
    "@@step": true
  };
}

function forEach$1(f) {
  return function (v, i, iterable, z) {
    return step(z, f(v, i, iterable));
  };
}

function filter$1(f) {
  return function (v, i, iterable, z) {
    if (f(v, i, iterable)) {
      return step(z, v);
    }
    return z;
  };
}

function foldLeft$1(f, z) {
  return function (v, i, iterable, z) {
    return f(z, v, i, iterable);
  };
}

function forEach(iterable, f) {
  if (arguments.length == 1) return forEach$1(iterable);
  return _iterate(iterable, forEach$1(f), _new(iterable));
}

function filter(iterable, f) {
  if (arguments.length == 1) return filter$1(iterable);
  return _iterate(iterable, filter$1(f), _new(iterable));
}

function foldLeft(iterable, f, z) {
  return _iterate(iterable, foldLeft$1(f), z);
}

// FIXME always return a collection, iterate by overriding _append to just return the value
function transform(iterable, f) {
  return _iterate(iterable, f);
  //    return new Iterator(iterable, f);
}

function into(iterable, f, z) {
  return _iterate(iterable, f, z);
}

// TODO:
// add Take/Nth/dropWhile/Range
// rewindable/fastforwardable iterators

const DONE = {
  done: true
};

function Iterator(iterable, f, z) {
  this.iterable = iterable;
  // iterate anything
  this.iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
    next: function () {
      return { value: iterable, done: true };
    }
  };
  this.f = f;
  this.z = z === undefined ? _new(iterable) : z;
  this.i = 0;
}

Iterator.prototype.next = function () {
  let next = this.iter.next();
  if (next.done) return DONE;
  let v = next.value;
  let z = this.z;
  let ret = this.f(v, this.i, this.iterable, z);
  if (ret["@@step"]) {
    z = _append(ret.z, ret.v);
  } else {
    z = ret;
  }
  this.z = z;
  this.i++;
  return { value: this.z };
};

Iterator.prototype[Symbol.iterator] = function () {
  return this;
};
},{}],10:[function(require,module,exports){
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

Value.prototype.toString = function (doc) {
	return this._value;
};

function VNode(inode, type, name, value, path, index, parent, indexInParent) {
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.path = path;
	this.index = index;
	this.parent = parent;
	this.indexInParent = indexInParent;
	Object.defineProperty(this, "children", {
		"get": () => {
			return (0, _transducers.into)(this.inode, (0, _transducers.forEach)((c, i) => new VNode(c, c._type, c._name, c._value, this.path, -1, this.inode, i)), []);
		}
	});
}

VNode.prototype.toString = function () {
	return this.inode.toString();
};

VNode.prototype.clone = function () {
	return new VNode(this.inode, this.type, this.name, this.value, this.path, this.index, this.parent, this.indexInParent);
};

function Step(inode, path, index, parent, indexInParent) {
	this.inode = inode;
	this.path = path;
	this.index = index;
	this.parent = parent;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this._depth + ", closes:" + this.parent.name + "}";
};

var OrderedMap = ohamt.empty.constructor;

function emptyINode(type, name, depth, attrs) {
	var inode = ohamt.make().beginMutation();
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

OrderedMap.prototype.toString = function (root = true) {
	var str = "";
	var type = this._type;
	const docAttrFunc = (z, v, k) => {
		return z += k == "DOCTYPE" ? "<!" + k + " " + v + ">" : "<?" + k + " " + v + "?>";
	};
	if (type == 1) {
		str += elemToString(this);
	} else if (type == 3) {
		str += this.toString();
	} else if (type == 9) {
		str = this._attrs.reduce(docAttrFunc, str);
		for (let c of this.values()) {
			str += c.toString(false);
		}
	}
	return root ? (0, _pretty.prettyXML)(str) : str;
};

function map(name, children) {}

function elem(name, children) {
	var node = new VNode(function (parent, insertIndex = -1) {
		var attrMap = ohamt.empty; //.beginMutation();
		let path = parent.path;
		let pvnode = parent.inode;
		let inode = emptyINode(1, name, pvnode._depth + 1, attrMap); //.beginMutation();
		node.inode = inode;
		node.index = path.length;
		node.indexInParent = pvnode.count();
		path.push(node);
		node.path = path;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			if (child.type == 2) {
				attrMap = attrMap.set(child.name, child.value);
			} else {
				child = child.inode(node);
				node.inode = restoreNode(child.parent, node.inode);
			}
		}
		//node.inode = node.inode; //.endMutation(true);
		node.inode._attrs = attrMap; //.endMutation(true);
		// insert into the parent means: update all parents until we come to the root
		// BUT creating an element doesn't mutate the doc yet, just the path
		// however, the parent is mutated, which means I have a new parent
		// so we just update our copy in the path
		if (insertIndex > -1) {
			node.parent = pvnode.insert(insertIndex, node.inode);
		} else {
			node.parent = restoreNode(pvnode.push([node.name, node.inode]), pvnode);
		}
		return node;
	}, 1, name);
	return node;
}

function text(value) {
	var node = new VNode(function (parent) {
		let pvnode = parent.inode;
		let path = parent.path;
		node.indexInParent = pvnode.count();
		node.name = node.indexInParent + 1;
		node.inode = new Value(3, node.name, value, pvnode._depth + 1);
		node.index = path.length;
		path.push(node);
		node.path = path;
		node.parent = restoreNode(pvnode.push([node.name, node.inode]), pvnode);
		return node;
	}, 3, null, value);
	return node;
}

function document() {
	return new VNode(emptyINode(9, "#document", 0, ohamt.empty), 9, "#document", null, [], -1);
}
},{"./pretty":6,"./transducers":9,"ohamt":12}],11:[function(require,module,exports){
/**
 * FastIntegerCompression.js : a fast integer compression library in JavaScript.
 * (c) the authors
 * Licensed under the Apache License, Version 2.0.
 *
 *FastIntegerCompression
 * Simple usage :
 *  // var FastIntegerCompression = require("fastintcompression");// if you use node
 *  var array = [10,100000,65999,10,10,0,1,1,2000];
 *  var buf = FastIntegerCompression.compress(array);
 *  var back = FastIntegerCompression.uncompress(buf); // gets back [10,100000,65999,10,10,0,1,1,2000]
 *
 *
 * You can install the library under node with the command line
 *   npm install fastintcompression
 */
'use strict';


// you can provide an iterable
function FastIntegerCompression() {
}

function bytelog(val) {
  if (val < (1 << 7)) {
    return 1;
  } else if (val < (1 << 14)) {
    return 2;
  } else if (val < (1 << 21)) {
    return 3;
  } else if (val < (1 << 28)) {
    return 4;
  }
  return 5;
}

// compute how many bytes an array of integers would use once compressed
FastIntegerCompression.computeCompressedSizeInBytes = function(input) {
  var c = input.length;
  var answer = 0;
  for(var i = 0; i < c; i++) {
    answer += bytelog(input[i]);
  }
  return answer;
};


// compress an array of integers, return a compressed buffer (as an ArrayBuffer)
FastIntegerCompression.compress = function(input) {
  var c = input.length;
  var buf = new ArrayBuffer(FastIntegerCompression.computeCompressedSizeInBytes(input));
  var view   = new Int8Array(buf);
  var pos = 0
  for(var i = 0; i < c; i++) {
    var val = input[i];
    if (val < (1 << 7)) {
      view[pos++] = val ;
    } else if (val < (1 << 14)) {
      view[pos++] = (val & 0x7F) | 0x80;
      view[pos++] = val >>> 7;
    } else if (val < (1 << 21)) {
      view[pos++] = (val & 0x7F) | 0x80;
      view[pos++] = ( (val >>> 7) & 0x7F ) | 0x80;
      view[pos++] = val >>> 14;
    } else if (val < (1 << 28)) {
      view[pos++] = (val & 0x7F ) | 0x80 ;
      view[pos++] = ( (val >>> 7) & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 14) & 0x7F ) | 0x80;
      view[pos++] = val >>> 21;
    } else {
      view[pos++] = ( val & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 7) & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 14) & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 21) & 0x7F ) | 0x80;
      view[pos++] = val >>> 28;
    }
  }
  return buf;
};

// from a compressed array of integers stored ArrayBuffer, compute the number of compressed integers by scanning the input
FastIntegerCompression.computeHowManyIntegers = function(input) {
  var view   = new UInt8Array(input);
  var c = view.length;
  var count = 0;
  for(var i = 0; i < c; i++) {
    count += (input[i]>>>7);
  }
  return c - count;
}

// uncompress an array of integer from an ArrayBuffer, return the array
FastIntegerCompression.uncompress = function(input) {
  var array = new Array()
  var inbyte = new Int8Array(input);
  var end = inbyte.length;
  var pos = 0;
  while (end > pos) {
        var c = inbyte[pos++];
        var v = c & 0x7F;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 7;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 14;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 21;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= c << 28;
        array.push(v)
  }
  return array;
};



///////////////

module.exports = FastIntegerCompression;

},{}],12:[function(require,module,exports){
/**
    @fileOverview Hash Array Mapped Trie.

    Code based on: https://github.com/exclipy/pdata
*/
const hamt = {}; // export

/* Configuration
 ******************************************************************************/
const SIZE = 5;

const BUCKET_SIZE = Math.pow(2, SIZE);

const MASK = BUCKET_SIZE - 1;

const MAX_INDEX_NODE = BUCKET_SIZE / 2;

const MIN_ARRAY_NODE = BUCKET_SIZE / 4;

/*
 ******************************************************************************/
const nothing = ({});

const constant = x => () => x;

/**
    Get 32 bit hash of string.

    Based on:
    http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
*/
const hash = hamt.hash = str => {
    const type = typeof str;
    if (type === 'number')
        return str;
    if (type !== 'string')
        str += '';

    let hash = 0;
    for (let i = 0, len = str.length; i < len; ++i) {
        const c = str.charCodeAt(i);
        hash = (((hash << 5) - hash) + c) | 0;
    }
    return hash;
};

/* Bit Ops
 ******************************************************************************/
/**
    Hamming weight.

    Taken from: http://jsperf.com/hamming-weight
*/
const popcount = (v) => {
    v -= ((v >>> 1) & 0x55555555); // works with signed or unsigned shifts
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
};

const hashFragment = (shift, h) =>
    (h >>> shift) & MASK;

const toBitmap = x =>
    1 << x;

const fromBitmap = (bitmap, bit) =>
    popcount(bitmap & (bit - 1));

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
        for (let i = 0; i < len; ++i)
            out[i] = arr[i];
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
        while (i < at)
            out[g++] = arr[i++];
    }
    ++i;
    while (i <= len)
        out[g++] = arr[i++];
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
        while (i >= at)
            arr[i--] = arr[i];
        arr[at] = v;
        return arr;
    }
    let i = 0, g = 0;
    const out = new Array(len + 1);
    while (i < at)
        out[g++] = arr[i++];
    out[at] = v;
    while (i < len)
        out[++g] = arr[i++];
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
const empty = ({
    __hamt_isEmpty: true
});

const isEmptyNode = x =>
    x === empty || (x && x.__hamt_isEmpty);

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
    id:id,
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


const Multi = (edit, hash, key, children) => ({
    type: MULTI,
    edit: edit,
    hash: hash,
    key: key,
    children: children,
    _modify: Multi__modify
});


/**
    Is `node` a leaf node?
*/
const isLeaf = node =>
    (node === empty || node.type === LEAF || node.type === COLLISION);

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
        if (bit & 1)
            arr[i] = subNodes[count++];
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
    if (h1 === h2)
        return Collision(edit, h1, [n2, n1]);

    const subH1 = hashFragment(shift, h1);
    const subH2 = hashFragment(shift, h2);
    return IndexedNode(edit, toBitmap(subH1) | toBitmap(subH2),
        subH1 === subH2 ? [mergeLeaves(edit, shift + SIZE, h1, n1, h2, n2)] :
            subH1 < subH2 ? [n1, n2] : [n2, n1]);
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
            if (newValue === value)
                return list;

            if (newValue === nothing) {
                --size.value;
                return arraySpliceOut(mutate, i, list);
            }
            return arrayUpdate(mutate, i, Leaf(edit, h, k, newValue, insert), list);
        }
    }

    const newValue = f();
    if (newValue === nothing)
        return list;
    ++size.value;
    return arrayUpdate(mutate, len, Leaf(edit, h, k, newValue, insert), list);
};

const updateMultiList = (mutate, edit, h, list, f, k, size, insert, multi) => {
    var len = list.length;
    var newValue = f();
    if (newValue === nothing) {
        --size.value;
        var idx = len - 1;
        if(multi !== undefined){
            for(;idx>=0;idx--) if(list[idx].id===multi) break;
        }
        return arraySpliceOut(mutate, idx, list);
    }
    ++size.value;
    return arrayUpdate(mutate, len, Leaf(edit, h, k, newValue, insert, list[len - 1].id + 1), list);
};

const canEditNode = (edit, node) => edit === node.edit;

/* Editing
 ******************************************************************************/
const Leaf__modify = function(edit, keyEq, shift, f, h, k, size, insert, multi) {
    var leaf;
    if (keyEq(k, this.key)) {
        let v = f(this.value);
        if (v === nothing) {
            --size.value;
            return empty;
        }
        if(multi){
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
    if(multi && leaf) {
        if(v===leaf.value) throw new Error("Either key or value must be unique in a multimap");
        return Multi(edit, h, k, [leaf, Leaf(edit, h, k, v, insert, multi)]);
    }
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

const Collision__modify = function(edit, keyEq, shift, f, h, k, size, insert, multi) {
    if (h === this.hash) {
        const canEdit = canEditNode(edit, this);
        const list = updateCollisionList(canEdit, edit, keyEq, this.hash, this.children, f, k, size, insert);
        if (list === this.children)
            return this;

        return list.length > 1 ? Collision(edit, this.hash, list) :
            list[0]; // collapse single element collision list
    }
    const v = f();
    if (v === nothing)
        return this;
    ++size.value;
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert,0));
};

const IndexedNode__modify = function(edit, keyEq, shift, f, h, k, size, insert, multi) {
    const mask = this.mask;
    const children = this.children;
    const frag = hashFragment(shift, h);
    const bit = toBitmap(frag);
    const indx = fromBitmap(mask, bit);
    const exists = mask & bit;
    const current = exists ? children[indx] : empty;
    const child = current._modify(edit, keyEq, shift + SIZE, f, h, k, size, insert, multi);

    if (current === child)
        return this;

    const canEdit = canEditNode(edit, this);
    let bitmap = mask;
    let newChildren;
    if (exists && isEmptyNode(child)) { // remove
        bitmap &= ~bit;
        if (!bitmap)
            return empty;
        if (children.length <= 2 && isLeaf(children[indx ^ 1]))
            return children[indx ^ 1]; // collapse

        newChildren = arraySpliceOut(canEdit, indx, children);
    } else if (!exists && !isEmptyNode(child)) { // add
        if (children.length >= MAX_INDEX_NODE)
            return expand(edit, frag, child, mask, children);

        bitmap |= bit;
        newChildren = arraySpliceIn(canEdit, indx, child, children);
    } else { // modify
        newChildren = arrayUpdate(canEdit, indx, child, children);
    }

    if (canEdit) {
        this.mask = bitmap;
        this.children = newChildren;
        return this;
    }
    return IndexedNode(edit, bitmap, newChildren);
};

const ArrayNode__modify = function(edit, keyEq, shift, f, h, k, size, insert, multi) {
    let count = this.size;
    const children = this.children;
    const frag = hashFragment(shift, h);
    const child = children[frag];
    const newChild = (child || empty)._modify(edit, keyEq, shift + SIZE, f, h, k, size);

    if (child === newChild)
        return this;

    const canEdit = canEditNode(edit, this);
    let newChildren;
    if (isEmptyNode(child) && !isEmptyNode(newChild)) { // add
        ++count;
        newChildren = arrayUpdate(canEdit, frag, newChild, children);
    } else if (!isEmptyNode(child) && isEmptyNode(newChild)) { // remove
        --count;
        if (count <= MIN_ARRAY_NODE)
            return pack(edit, count, frag, children);
        newChildren = arrayUpdate(canEdit, frag, empty, children);
    } else { // modify
        newChildren = arrayUpdate(canEdit, frag, newChild, children);
    }

    if (canEdit) {
        this.size = count;
        this.children = newChildren;
        return this;
    }
    return ArrayNode(edit, count, newChildren);
};


const Multi__modify = function(edit, keyEq, shift, f, h, k, size, insert, multi) {
    if (keyEq(k,this.key)) {
        // modify
        const canEdit = canEditNode(edit, this);
        var list = this.children;
        // if Multi exists, find leaf
        list = updateMultiList(canEdit, edit, h, list, f, k, size, insert, multi);
        if (list === this.children) return this;

        if(list.length > 1) return Multi(edit, h, k, list);
        // collapse single element collision list
        return list[0];
    }
    let v = f();
    if (v === nothing) return this;
    ++size.value;
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

empty._modify = (edit, keyEq, shift, f, h, k, size, insert) => {
    const v = f();
    if (v === nothing)
        return empty;
    ++size.value;
    return Leaf(edit, h, k, v, insert, 0);
};

/* Ordered / Multi helpers
 ******************************************************************************/

function getLeafOrMulti(node,hash,key){
    var s = 0, len = 0;
    while(node && node.type > 1) {
        if(node.type == 2){
            len = node.children.length;
            for(var i=0;i<len;i++) {
                var c = node.children[i];
                if(c.key === key) {
                    node = c;
                    break;
                }
            }
        } else if(node.type == 3) {
            var frag = hashFragment(s, hash);
            var bit = toBitmap(frag);
            if (node.mask & bit) {
                node = node.children[fromBitmap(node.mask, bit)];
            } else {
                return;
            }
            s += SIZE;
        } else if(node.type == 4) {
            node = node.children[hashFragment(s, hash)];
            s += SIZE;
        } else {
            // just return
            if(node.key === key) {
                return node;
            } else {
                return;
            }
        }
    }
    if(node.key === key) return node;
}

function getLeafFromMulti(node,id){
    for(var i = 0, len = node.children.length; i < len; i++){
        var c = node.children[i];
        if(c.id === id) return c;
    }
}

function getLeafFromMultiV(node,val){
    for(var i = 0, len = node.children.length; i < len; i++){
        var c = node.children[i];
        if(c.value === val) return c;
    }
}

function updatePosition(parent,edit,entry,val,prev = false,s = 0){
    var len = 0, type = parent.type, node = null, idx = 0, hash = entry[0], key = entry[1], id = entry[2];
    if(type == 1) {
        return Leaf(edit, parent.hash, parent.key, parent.value, prev ? val : parent.prev, parent.id, prev ? parent.next : val);
    }
    var children = parent.children;
    if(type == 2) {
        len = children.length;
        for (; idx < len; ++idx) {
            node = children[idx];
            if (key === node.key) break;
        }
    } else if(type == 3) {
        var frag = hashFragment(s, hash);
        var bit = toBitmap(frag);
        if (parent.mask & bit) {
            idx = fromBitmap(parent.mask, bit);
            node = children[idx];
            s += SIZE;
        }
    } else if(type == 4) {
        idx = hashFragment(s, hash);
        node = children[idx];
        s += SIZE;
    } else if(type == 5){
        // assume not in use
        len = children.length;
        for(;idx<len;) {
            node = children[idx];
            if(node.id === id) break;
            idx++;
        }

    }
    if(node){
        children = arrayUpdate(canEditNode(edit, node), idx, updatePosition(node,edit,entry,val,prev,s), children);
        if(type == 2){
            return Collision(edit, parent.hash, children);
        } else if(type == 3){
            return IndexedNode(edit, parent.mask, children);
        } else if(type == 4){
            return ArrayNode(edit, parent.size, children);
        } else if(type == 5){
            return Multi(edit, hash, key, children);
        }
    }
    return parent;
}

function last(arr){
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

Map.prototype.setTree = function(newRoot, newSize, insert) {
    var start = newSize == 1 ? insert : this._start;
    if (this._editable) {
        this._root = newRoot;
        this._size = newSize;
        this._insert = insert;
        this._start = start;
        return this;
    }
    return newRoot === this._root ? this :
        new Map(this._editable, this._edit, this._config, newRoot, newSize, start, insert);
};

/* Queries
 ******************************************************************************/
/**
    Lookup the value for `key` in `map` using a custom `hash`.

    Returns the value or `alt` if none.
*/
const tryGetHash = hamt.tryGetHash = (alt, hash, key, map) => {
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
                    if (keyEq(key, child.key))
                        return child.value;
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
            for(let i=0, len=node.children.length;i<len; i++){
                var c = node.children[i];
                ret.push(c.value);
            }
            return ret;
        }
        default:
            return alt;
    }
};

Map.prototype.tryGetHash = function(alt, hash, key) {
    return tryGetHash(alt, hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.

    @see `tryGetHash`
*/
const tryGet = hamt.tryGet = (alt, key, map) =>
    tryGetHash(alt, map._config.hash(key), key, map);

Map.prototype.tryGet = function(alt, key) {
    return tryGet(alt, key, this);
};

/**
    Lookup the value for `key` in `map` using a custom `hash`.

    Returns the value or `undefined` if none.
*/
const getHash = hamt.getHash = (hash, key, map) =>
    tryGetHash(undefined, hash, key, map);

Map.prototype.getHash = function(hash, key) {
    return getHash(hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.

    @see `get`
*/
const get = hamt.get = (key, map) =>
    tryGetHash(undefined, map._config.hash(key), key, map);

Map.prototype.get = function(key, alt) {
    return tryGet(alt, key, this);
};

Map.prototype.first = function(){
    var start = this._start;
    var node = getLeafOrMulti(this._root, start[0], start[1]);
    if(node.type == MULTI) node = getLeafFromMulti(node,start[2]);
    return node.value;
};

Map.prototype.last = function(){
    var end = this._init;
    var node = getLeafOrMulti(this._root, end[0], end[1]);
    if(node.type == MULTI) node = getLeafFromMulti(node,end[2]);
    return node.value;
};

Map.prototype.next = function (key, val) {
    var node = getLeafOrMulti(this._root, hash(key), key);
    if(node.type == MULTI) {
        node = getLeafFromMultiV(node,val);
    }
    if(node.next === undefined) return;
    var next = getLeafOrMulti(this._root, node.next[0], node.next[1]);
    if(next.type == MULTI) {
        next = getLeafFromMulti(next,node.next[2]);
    }
    return next.value;
};

/**
    Does an entry exist for `key` in `map`? Uses custom `hash`.
*/
const hasHash = hamt.has = (hash, key, map) =>
    tryGetHash(nothing, hash, key, map) !== nothing;

Map.prototype.hasHash = function(hash, key) {
    return hasHash(hash, key, this);
};

/**
    Does an entry exist for `key` in `map`? Uses internal hash function.
*/
const has = hamt.has = (key, map) =>
    hasHash(map._config.hash(key), key, map);

Map.prototype.has = function(key) {
    return has(key, this);
};

const defKeyCompare = (x, y) => x === y;

/**
    Create an empty map.

    @param config Configuration.
*/
hamt.make = (config) =>
    new Map(0, 0, {
        keyEq: (config && config.keyEq) || defKeyCompare,
        hash: (config && config.hash) || hash
    }, empty, 0);

/**
    Empty map.
*/
hamt.empty = hamt.make();

/**
    Does `map` contain any elements?
*/
const isEmpty = hamt.isEmpty = (map) =>
    map && !!isEmptyNode(map._root);

Map.prototype.isEmpty = function() {
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
const modifyHash = hamt.modifyHash = (f, hash, key, insert, multi, map) => {
    const size = { value: map._size };
    const newRoot = map._root._modify(
        map._editable ? map._edit : NaN,
        map._config.keyEq,
        0,
        f,
        hash,
        key,
        size,
        insert,
        multi);
    return map.setTree(newRoot, size.value, insert || !map._size ? [hash,key,multi] : map._insert);
};

Map.prototype.modifyHash = function(hash, key, f) {
    return modifyHash(f, hash, key, this.has(key), false, this);
};

/**
    Alter the value stored for `key` in `map` using function `f` using
    internal hash function.

    @see `modifyHash`
*/
const modify = hamt.modify = (f, key, map) =>
    modifyHash(f, map._config.hash(key), key, map.has(key), false, map);

Map.prototype.modify = function(key, f) {
    return modify(f, key, this);
};

/**
    Store `value` for `key` in `map` using custom `hash`.

    Returns a map with the modified value. Does not alter `map`.
*/
const setHash = hamt.setHash = (hash, key, value, map) =>
    appendHash(hash, key, value, map.has(key), map);

Map.prototype.setHash = function(hash, key, value) {
    return setHash(hash, key, value, this);
};

const appendHash = hamt.appendHash = function(hash, key, value, exists, map){
    var insert = map._insert;
    map = modifyHash(constant(value), hash, key, exists ? null : insert, 0, map);
    if(insert && !exists) {
        const edit = map._editable ? map._edit : NaN;
        map._root = updatePosition(map._root,edit,insert,[hash,key]);
        if(map._start[1] === key) {
            var node = getLeafOrMulti(map._root,hash,key);
            var next = node.next;
            map._root = updatePosition(map._root,edit,[hash,key],undefined);
            map._root = updatePosition(map._root,edit,node.next,undefined,true);
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
const set = hamt.set = (key, value, map) =>
    setHash(map._config.hash(key), key, value, map);

Map.prototype.set = function(key, value) {
    return set(key, value, this);
};

/**
 * multi-map
 * - create an extra bucket for each entry with same key
 */
const addHash = hamt.addHash = function(hash, key, value, map){
    var insert = map._insert;
    var node = getLeafOrMulti(map._root,hash,key);
    var multi = node ? node.type == MULTI ? last(node.children).id+1 : node.type == LEAF ? node.id+1 : 0 : 0;
    var newmap = modifyHash(constant(value), hash, key, insert, multi, map);
    if(insert) {
        const edit = map._editable ? map._edit : NaN;
        newmap._root = updatePosition(newmap._root,edit,insert,[hash,key,multi]);
    }
    return newmap;
};

// single push, like arrays
Map.prototype.push = function (kv) {
    var key = kv[0], value = kv[1];
    return addHash(hash(key), key, value, this);
};


/**
    Remove the entry for `key` in `map`.

    Returns a map with the value removed. Does not alter `map`.
*/
const del = constant(nothing);
const removeHash = hamt.removeHash = (hash, key, val, map) => {
    // in case of collision, we need a leaf
    var node = getLeafOrMulti(map._root, hash, key);
    if(node === undefined) return map;
    var prev = node.prev, next = node.next;
    var insert = map._insert;
    var leaf;
    if(node.type == MULTI){
        // last will be removed
        leaf = val!==undefined ? getLeafFromMultiV(node,val) : last(node.children);
        prev = leaf.prev;
        next = leaf.next;
    }
    map = modifyHash(del, hash, key, null, leaf ? leaf.id : undefined, map);
    const edit = map._editable ? map._edit : NaN;
    var id = leaf ? leaf.id : 0;
    if(prev !== undefined) {
        map._root = updatePosition(map._root,edit,prev,next);
        if(insert && insert[1] === key && insert[2] === id) map._insert = prev;
    }
    if(next !== undefined) {
        map._root = updatePosition(map._root,edit,next,prev,true);
        if(map._start[1] === key && map._start[2] === id) {
            //next = node.next;
            map._root = updatePosition(map._root,edit,next,undefined,true);
            map._start = next;
        }
    }
    if(next === undefined && prev === undefined){
        map._insert = map._start = undefined;
    }
    return map;
};

Map.prototype.removeHash = Map.prototype.deleteHash = function(hash, key) {
    return removeHash(hash, key, this);
};

/**
    Remove the entry for `key` in `map` using internal hash function.

    @see `removeHash`
*/
const remove = hamt.remove = (key, map) =>
    removeHash(map._config.hash(key), key, undefined, map);

Map.prototype.remove = Map.prototype.delete = function(key) {
    return remove(key, this);
};

// MULTI:
const removeValue = hamt.removeValue = (key, val, map) =>
    removeHash(map._config.hash(key), key, val, map);

Map.prototype.removeValue = Map.prototype.deleteValue = function(key,val) {
    return removeValue(key, val, this);
};
/* Mutation
 ******************************************************************************/
 /**
     Mark `map` as mutable.
  */
const beginMutation = hamt.beginMutation = (map) =>
    new Map(
        map._editable + 1,
        map._edit + 1,
        map._config,
        map._root,
        map._size,
        map._start,
        map._insert);

Map.prototype.beginMutation = function() {
    return beginMutation(this);
};

/**
    Mark `map` as immutable.
 */
const endMutation = hamt.endMutation = (map) => {
    map._editable = map._editable && map._editable - 1;
    return map;
};

Map.prototype.endMutation = function() {
    return endMutation(this);
};

/**
    Mutate `map` within the context of `f`.
    @param f
    @param map HAMT
*/
const mutate = hamt.mutate = (f, map) => {
    const transient = beginMutation(map);
    f(transient);
    return endMutation(transient);
};

Map.prototype.mutate = function(f) {
    return mutate(f, this);
};

/* Traversal
 ******************************************************************************/
 const DONE = {
     done: true
 };

 function MapIterator(root,v,f) {
     this.root = root;
     this.f = f;
     this.v = v;
 }

 MapIterator.prototype.next = function () {
     var v = this.v;
     if (!v) return DONE;
     var node = getLeafOrMulti(this.root,v[0], v[1]);
     if(node.type == MULTI) {
         node = getLeafFromMulti(node,v[2]);
         if(!node) return DONE;
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
const visit = (map, f) => new MapIterator(map._root, map._start, f);

/**
    Get a Javascsript iterator of `map`.

    Iterates over `[key, value]` arrays.
*/
const buildPairs = (x) => [x.key, x.value];
const entries = hamt.entries = (map) =>
    visit(map, buildPairs);

Map.prototype.entries = Map.prototype[Symbol.iterator] = function() {
    return entries(this);
};

/**
    Get array of all keys in `map`.

    Order is not guaranteed.
*/
const buildKeys = (x) => x.key;
const keys = hamt.keys = (map) =>
    visit(map, buildKeys);

Map.prototype.keys = function() {
    return keys(this);
};

/**
    Get array of all values in `map`.

    Order is not guaranteed, duplicates are preserved.
*/
const buildValues = x => x.value;
const values = hamt.values = Map.prototype.values = map =>
    visit(map, buildValues);

Map.prototype.values = function() {
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
const fold = hamt.fold = (f, z, m) => {
    var root = m._root;
    if(isEmptyNode(root)) return z;
    var v = m._start;
    var node;
    do {
        node = getLeafOrMulti(root,v[0],v[1]);
        v = node.next;
        z = f(z, node.value, node.key);
    } while(node && node.next);
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
const forEach = hamt.forEach = (f, map) =>
    fold((_, value, key) => f(value, key, map), null, map);

Map.prototype.forEach = function(f) {
    return forEach(f, this);
};

/* Aggregate
 ******************************************************************************/
/**
    Get the number of entries in `map`.
*/
const count = hamt.count = map =>
    map._size;

Map.prototype.count = function() {
    return count(this);
};

Object.defineProperty(Map.prototype, 'size', {
    get: Map.prototype.count
});

/* Export
 ******************************************************************************/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = hamt;
} else if (typeof define === 'function' && define.amd) {
    define('hamt', [], () => hamt);
} else {
    this.hamt = hamt;
}

},{}]},{},[3])(3)
});
