"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.last = exports.position = exports.isVNode = undefined;
exports.Step = Step;
exports.children = children;
exports.vdoc = vdoc;
exports.nextNode = nextNode;
exports.stringify = stringify;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.previousSibling = previousSibling;
exports.getDoc = getDoc;
exports.lastChild = lastChild;
exports.parent = parent;
exports.self = self;
exports.iter = iter;
exports.cxFilter = cxFilter;
exports.element = element;
exports.list = list;
exports.map = map;
exports.processingInstruction = processingInstruction;
exports.comment = comment;
exports.attribute = attribute;
exports.text = text;
exports.node = node;
exports.child = child;
exports.siblingsOrSelf = siblingsOrSelf;
exports.select = select;
exports.isEmptyNode = isEmptyNode;
exports.name = name;

var _doc = require("./doc");

var _error = require("./error");

var _seq = require("./seq");

var _pretty = require("./pretty");

var _util = require("./util");

function Step(node) {
	this.node = node;
	this.inode = node.inode;
	this.parent = node.parent;
	this.depth = node.depth;
	this.indexInParent = node.indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this.node.depth + ", closes:" + this.node.name + "}";
};

var _vnodeFromCx = function _vnodeFromCx(cx, node) {
	return cx && "vnode" in cx ? cx.vnode : node.cx.vnode;
};

function children($node) {
	var cx = this;
	return _doc.ensureDoc.bind(cx)($node).concatMap(function (node) {
		var vnode = _vnodeFromCx(cx, node);
		var values = node.type == 2 ? [node.inode] : node.values();
		var depth = node.depth + 1;
		return (0, _seq.seq)(values).map(function (inode, idx) {
			return vnode(inode, node, depth, idx + 1);
		});
	});
}

function vdoc($node) {
	var cx = this;
	$node = _doc.ensureDoc.bind(cx)($node);
	return (0, _seq.create)(function (o) {
		return $node.subscribe({
			next: function next(node) {
				while (node) {
					o.next(node);
					node = nextNode(node);
				}
				o.complete();
			},
			error: o.error
		});
	});
}

// FIXME nextNode is never eligable for seqs, so it shouldn't be exposed
// TODO write nextNode function: create observable for current node, subscribe and call nextNode
function nextNode(node /* VNode */) {
	var type = node.type,
	    inode = node.inode,
	    parent = node.parent,
	    indexInParent = node.indexInParent || 0;
	var depth = node.depth || 0;
	// FIXME improve check
	if (type != 17 && (type == 1 || type == 5 || type == 6 || type == 14) && node.count() === 0) {
		return new Step(node);
	}
	if (type != 17 && node.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = node;
		inode = node.first();
		// TODO handle arrays
		node = parent.vnode(inode, parent, depth, indexInParent);
		//console.log("found first", node.type, depth,indexInParent);
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
			node = new Step(node);
			//console.log("found step", node.type, depth, indexInParent);
			return node;
		} else {
			// return the next child
			inode = parent.next(node);
			if (inode !== undefined) {
				node = parent.vnode(inode, parent, depth, indexInParent);
				//console.log("found next", node.type, depth, indexInParent);
				return node;
			}
		}
	}
}
/*
export function* prevNode(node){
	//var depth = node.depth;
	while(node){
		if(!node.size) {
			//depth--;
			node = node.parent;
			if(!node) break;
			yield node;
		} else{
			if(!("indexInParent" in node)) node.indexInParent = node.parent.size;
			node.indexInParent--;
			node = node.getByIndex(node.indexInParent);
		}
	}
}
*/
function stringify($input) {
	var attrFunc = function attrFunc(z, kv) {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	var docAttrFunc = function docAttrFunc(z, kv) {
		return z += kv[0] == "DOCTYPE" ? "<!" + kv[0] + " " + kv[1] + ">" : "<?" + kv[0] + " " + kv[1] + "?>";
	};
	return vdoc($input).reduce(function (str, node) {
		var type = node.type;
		if (type == 1) {
			str += "<" + node.name;
			str = (0, _seq.foldLeft)(node.attrEntries(), str, attrFunc);
			if (!node.count()) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			str += (0, _seq.foldLeft)(node.attrEntries(), str, docAttrFunc);
		} else if (type == 17) {
			str += "</" + node.name + ">";
		}
		return str;
	}, "").map(function (str) {
		return (0, _pretty.prettyXML)(str);
	});
}

function firstChild($node) {
	var cx = this;
	// assume ensureDoc returns the correct node
	return _doc.ensureDoc.bind(cx)($node).concatMap(function (node) {
		var vnode = _vnodeFromCx(cx, node);
		var next = node.first();
		return next ? (0, _seq.seq)(vnode(next, node, node.depth + 1, 0)) : (0, _seq.seq)();
	});
}

var _nextOrPrev = function _nextOrPrev(cx, $node, dir) {
	return _doc.ensureDoc.bind(cx)($node).concatMap(function (node) {
		var vnode = _vnodeFromCx(cx, node);
		var parent = node.parent;
		var sib = parent && parent[dir > 0 ? "next" : "previous"](node);
		return sib ? (0, _seq.seq)(vnode(sib, parent, node.depth, node.indexInParent + dir)) : (0, _seq.seq)();
	});
};

function nextSibling($node) {
	return _nextOrPrev(this, $node, 1);
}

function previousSibling($node) {
	return _nextOrPrev(this, $node, -1);
}

function getDoc($node) {
	var cx = this;
	return _doc.ensureDoc.bind(cx)($node).concatMap(function (node) {
		do {
			node = node.parent;
		} while (node.parent);
		return (0, _seq.seq)(node);
	});
}

function lastChild($node) {
	var cx = this;
	return _doc.ensureDoc.bind(cx)($node).concatMap(function (node) {
		var last = node.last();
		var vnode = cx.vnode || node.cx.vnode;
		return vnode(last, node, node.depth + 1, node.count() - 1);
	});
}

function parent($node) {
	if (!arguments.length) return Axis(parent);
	var cx = this;
	return _doc.ensureDoc.bind(cx)($node).concatMap(function (node) {
		return (0, _seq.seq)(node.parent);
	});
}

function self($f) {
	return (0, _seq.zeroOrOne)($f).map(function (f) {
		if (f.name !== "forEach" && f.name !== "filter") f = (0, _seq.forEach)(f);
		return Axis(function (node) {
			return node;
		}, f, 3);
	});
}

function iter(node, f, cb) {
	// FIXME pass doc?
	var i = 0,
	    prev = node;
	if (!f) f = function f() {};
	node = _doc.ensureDoc.bind(this)(node);
	f(node, i++);
	while (node) {
		node = nextNode(node);
		if (node) {
			f(node, i++);
		}
	}
	if (cb) cb();
	return prev;
}

var isVNode = exports.isVNode = function isVNode(n) {
	return !!n && n.__is_VNode;
};

var _isElement = function _isElement(n) {
	return isVNode(n) && n.type == 1;
};

var _isAttribute = function _isAttribute(n) {
	return isVNode(n) && n.type == 2;
};

var _isText = function _isText(n) {
	return isVNode(n) && n.type == 3;
};

var _isList = function _isList(n) {
	return isVNode(n) && n.type == 5;
};

var _isMap = function _isMap(n) {
	return isVNode(n) && n.type == 6;
};

var _isPI = function _isPI(n) {
	return isVNode(n) && n.type == 7;
};

var _isComment = function _isComment(n) {
	return isVNode(n) && n.type == 8;
};

var _isLiteral = function _isLiteral(n) {
	return isVNode(n) && n.type == 12;
};

function cxFilter(iterable, f) {
	return (0, _seq.filter)(iterable, function (v, k, i) {
		if (!(0, _seq.isSeq)(v) && !isVNode(v)) v = (0, _seq.seq)(v);
		v.__cx = [k, i];
		return f(v, k, i);
	});
}

var position = exports.position = function position(n) {
	return n.__cx ? n.__cx[0] + 1 : n.indexInParent;
};

var last = exports.last = function last(n) {
	return n.__cx ? n.__cx[1].size : n.parent ? n.parent.size : 1;
};

var _isEq = function _isEq(a, b) {
	return a === b;
};

// TODO convert qname to integer when parent is array
function _nodeTest(typeTest, qnameOrKey) {
	var f;
	if (qnameOrKey === undefined) {
		f = typeTest;
	} else {
		var hasWildcard = /\*/.test(qnameOrKey);
		if (hasWildcard) {
			var regex = new RegExp(qnameOrKey.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			f = function f(n) {
				var isTuple = n.parent.type == 6;
				if (isTuple || n.name) {
					return typeTest(n) && regex.test(isTuple ? n.key : n.name);
				}
				return typeTest(n);
			};
		} else {
			f = function f(n) {
				var isTuple = n.parent.type == 6;
				if (isTuple || n.name) {
					return _isEq(isTuple ? n.key : n.name, qnameOrKey) && typeTest(n);
				}
				return typeTest(n);
			};
			f.__Accessor = qnameOrKey;
		}
	}
	f.__is_NodeTypeTest = true;
	return f;
}

function element(qname) {
	return _nodeTest(_isElement, qname);
}

function list(keyOrIndex) {
	return _nodeTest(_isList, keyOrIndex);
}

function map() {
	return _nodeTest(_isMap);
}

function processingInstruction() {
	return _nodeTest(_isPI);
}

function comment() {
	return _nodeTest(_isComment);
}

function _attrGet(key, node) {
	var entries;
	if (key !== null) {
		var val = node.attr(key);
		if (!val) return [];
		entries = [[key, val]];
	} else {
		entries = node.attrEntries();
	}
	return (0, _seq.seq)(entries).map(function (kv) {
		return node.vnode(node.ituple(kv[0], kv[1]), node.parent, node.depth + 1, node.indexInParent);
	});
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
function attribute($qname) {
	if ((0, _util.isUndef)($qname)) $qname = "*";
	return (0, _seq.exactlyOne)($qname).map(function (qname) {
		var hasWildcard = /\*/.test(qname);
		// getter of attributes / pre-processor of attributes
		// TODO iterator!
		// filter of attributes
		var f;
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			//	attrEntries returns tuples
			f = function f(n) {
				return _isAttribute(n) && regex.test(n.name);
			};
			// no direct access
			qname = null;
		} else {
			// name check provided by directAccess
			f = function f(n) {
				return _isAttribute(n);
			};
		}
		return Axis(_attrGet.bind(null, qname), (0, _seq.filter)(f), 2);
	});
}

function text() {
	var f = function f(n) {
		return _isText(n) && !!n.value;
	};
	f.__is_NodeTypeTest = true;
	return (0, _seq.seq)(f);
}

function node() {
	var f = function f(n) {
		return _isElement(n) || _isText(n) && !!n.value;
	};
	f.__is_NodeTypeTest = true;
	return (0, _seq.seq)(f);
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
function Axis(g, f, type) {
	return {
		__is_Axis: true,
		__type: type || 1,
		f: f,
		g: g
	};
}
function child($f) {
	var cx = this;
	return (0, _seq.zeroOrOne)($f).map(function (f) {
		if (f.__is_NodeTypeTest) {
			// this means it's a predicate, and the actual function should become a filter
			if (f.__Accessor) {
				// TODO this means we can try direct access on a node
			}
			f = (0, _seq.filter)(f);
		}
		return Axis(function (node) {
			return children.bind(cx)(node);
		}, f);
	});
}

function siblingsOrSelf($node) {
	var cx = this;
	return _doc.ensureDoc.bind(cx)($node).concatMap(function (node) {
		return children.bind(cx)(node.parent);
	});
}

function select($node) {
	var cx = this;
	var boundEnsureDoc = _doc.ensureDoc.bind(cx);

	for (var _len = arguments.length, paths = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		paths[_key - 1] = arguments[_key];
	}

	return (0, _seq.seq)(paths).concatMap(function (path) {
		return (0, _seq.seq)(_axify(path));
	})
	// we're passing $node here, because we want to update it every iteration
		.map(function (path) {
			return function ($node) {
			// make sure all paths are funcs
			// TODO skip self
				var skipCompare = path.__type == 2 || path.__type == 3;
				var f = path.f;
				// rebind step function to the context
				var bound = function bound(n) {
					return path.g(boundEnsureDoc(n));
				};
				if (!skipCompare) f = (0, _seq.compose)(f, (0, _seq.filter)(_comparer()));
				return (0, _seq.seq)($node).concatMap(function (node) {
					return _seq.seq(f).concatMap(f => f(bound(node)));
				});
			};
		}).reduce(function ($node, changeFn) {
			return changeFn($node);
		}, boundEnsureDoc($node)).concatAll();
}

function _comparer() {
	// dirty preserve state on function
	var f = function f(node) {
		var has = f._checked.has(node);
		if (!has) f._checked.set(node, true);
		return !has;
	};
	f._checked = new WeakMap();
	return f;
}

/*
export function* select2(node,...paths) {
	// TODO
	// 1: node (or seq) is iterable, so get first as current context
	// 2: each function is a filter (either a node is returned or the process stops)
	// 3: pass each single result to a filter function, yielding a result for each
	var bed = ensureDoc.bind(this);
	var next = bed(node);
	var cx = next;
	if(next) {
		next = nextNode(next);
		while(next){
			for(var i=0,l=paths.length,path=paths[i]; i<l; i++){
				if(!isSeq(path)) path = seq(path);
				// process strings (can this be combined?)
				path = transform(path,compose(forEach(function(path){
					if(typeof path == "string") {
						var at = /^@/.test(path);
						if(at) path = path.substring(1);
						return at ? attribute(path) : element(path);
					}
					return [path];
				}),cat));
				var composed = compose.apply(null,path.toArray());
				let ret = composed.call(cx,next);
				if(node) {
					yield ret;
				} else {
					break;
				}
			}
		}
	}
}
*/
function _axify($path) {
	return (0, _seq.seq)($path).concatMap(function (path) {
		if (!path.__is_Axis) {
			// process strings (can this be combined?)
			if (typeof path == "string") {
				var at = /^@/.test(path);
				if (at) path = path.substring(1);
				return at ? attribute(path) : child(element(path));
			} else if (typeof path == "function") {
				if (path.__is_NodeTypeTest) return child(path);
				return self(path);
			} else {
				return (0, _error.error)("XXX", "Unknown axis provided");
			}
		}
		return (0, _seq.seq)(path);
	});
}

function isEmptyNode(node) {
	node = _doc.ensureDoc.bind(this)(node);
	if (!isVNode(node)) return false;
	if (_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.count();
}

function name($a) {
	if ((0, _seq.isSeq)($a)) return (0, _seq.forEach)($a, name);
	if (!isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}
