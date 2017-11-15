import { ensureDoc } from "./doc";

import { error } from "./error";

import { seq, isSeq, create, forEach, filter, compose, foldLeft, zeroOrOne, exactlyOne } from "./seq";

import { prettyXML } from "./pretty";

import { isUndef } from "./util";

export function Step(node){
	this.node = node;
	this.inode = node.inode;
	this.parent = node.parent;
	this.depth = node.depth;
	this.indexInParent = node.indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function(){
	return "Step {depth:" + this.node.depth + ", closes:" + this.node.name + "}";
};

const _vnodeFromCx = (cx,node) => cx && "vnode" in cx ? cx.vnode : node.cx.vnode;

export function children($node) {
	const cx = this;
	return ensureDoc.bind(cx)($node).concatMap(node => {
		const vnode = _vnodeFromCx(cx,node);
		const values = node.type == 2 ? [node.inode] : node.values();
		const depth = node.depth + 1;
		return seq(values).map((inode, idx) => vnode(inode,node,depth,idx + 1));
	});
}

export function vdoc($node) {
	const cx = this;
	$node = ensureDoc.bind(cx)($node);
	return create(o => $node.subscribe({
		next:function(node){
			while(node){
				o.next(node);
				node = nextNode(node);
			}
			o.complete();
		},
		error:o.error
	}));
}

// FIXME nextNode is never eligable for seqs, so it shouldn't be exposed
// TODO write nextNode function: create observable for current node, subscribe and call nextNode
export function nextNode(node /* VNode */) {
	var type = node.type,
		inode = node.inode,
		parent = node.parent,
		indexInParent = node.indexInParent || 0;
	var depth = node.depth || 0;
	// FIXME improve check
	if(type != 17 && (type == 1 || type == 5  || type == 6 || type == 14) && node.count() === 0) {
		return new Step(node);
	}
	if(type != 17 && node.count() > 0) {
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
export function stringify($input){
	const attrFunc = (z, kv) => {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	const docAttrFunc = (z, kv) => {
		return z += kv[0] == "DOCTYPE" ? "<!" + kv[0] + " " + kv[1] + ">" : "<?" + kv[0] + " " + kv[1] + "?>";
	};
	return vdoc($input).reduce((str,node) => {
		let type = node.type;
		if (type == 1) {
			str += "<" + node.name;
			str = foldLeft(node.attrEntries(),str,attrFunc);
			if (!node.count()) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			str += foldLeft(node.attrEntries(),str,docAttrFunc);
		} else if (type == 17) {
			str += "</" + node.name + ">";
		}
		return str;
	},"").map(str => prettyXML(str));
}

export function firstChild($node) {
	const cx = this;
	// assume ensureDoc returns the correct node
	return ensureDoc.bind(cx)($node).concatMap(node => {
		const vnode = _vnodeFromCx(cx,node);
		let next = node.first();
		return next ? seq(vnode(next,node,node.depth + 1, 0)) : seq();
	});
}

const _nextOrPrev = (cx,$node,dir) => {
	return ensureDoc.bind(cx)($node).concatMap(node => {
		const vnode = _vnodeFromCx(cx,node);
		var parent = node.parent;
		const sib = parent && parent[dir > 0 ? "next" : "previous"](node);
		return sib ? seq(vnode(sib, parent, node.depth, node.indexInParent + dir)) : seq();
	});
};

export function nextSibling($node){
	return _nextOrPrev(this, $node, 1);
}

export function previousSibling($node){
	return _nextOrPrev(this, $node, -1);
}

export function getDoc($node) {
	var cx = this;
	return ensureDoc.bind(cx)($node).concatMap(node => {
		do {
			node = node.parent;
		} while(node.parent);
		return seq(node);
	});
}

export function lastChild($node){
	var cx = this;
	return ensureDoc.bind(cx)($node).concatMap(node => {
		const last = node.last();
		const vnode = cx.vnode || node.cx.vnode;
		return vnode(last,node,node.depth+1, node.count() - 1);
	});
}

export function parent($node) {
	if(!arguments.length) return Axis(parent);
	var cx = this;
	return ensureDoc.bind(cx)($node).concatMap(node => seq(node.parent));
}

export function self($f) {
	return zeroOrOne($f).map(f => {
		if(f.name !== "forEach" && f.name !== "filter") f = forEach(f);
		return Axis(node => node, f, 3);
	});
}

export function iter(node, f, cb) {
	// FIXME pass doc?
	var i=0, prev=node;
	if(!f) f = () => {};
	node = ensureDoc.bind(this)(node);
	f(node,i++);
	while (node) {
		node = nextNode(node);
		if(node) {
			f(node,i++);
		}
	}
	if(cb) cb();
	return prev;
}

export const isVNode = n => !!n && n.__is_VNode;

const _isElement = n => isVNode(n) && n.type == 1;

const _isAttribute = n => isVNode(n) && n.type == 2;

const _isText = n => isVNode(n) && n.type == 3;

const _isList = n => isVNode(n) && n.type == 5;

const _isMap = n => isVNode(n) && n.type == 6;

const _isPI = n => isVNode(n) && n.type == 7;

const _isComment = n => isVNode(n) && n.type == 8;

const _isLiteral = n => isVNode(n) && n.type == 12;

export function cxFilter(iterable,f){
	return filter(iterable,function(v,k,i){
		if(!isSeq(v) && !isVNode(v)) v = seq(v);
		v.__cx = [k,i];
		return f(v,k,i);
	});
}

export const position = n => n.__cx ? n.__cx[0] + 1 : n.indexInParent;

export const last = n => n.__cx ? n.__cx[1].size : n.parent ? n.parent.size : 1;

const _isEq = (a,b) => a === b;

// TODO convert qname to integer when parent is array
function _nodeTest(typeTest,qnameOrKey) {
	var f;
	if (qnameOrKey === undefined) {
		f = typeTest;
	} else {
		var hasWildcard = /\*/.test(qnameOrKey);
		if (hasWildcard) {
			var regex = new RegExp(qnameOrKey.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			f = n => {
				let isTuple = n.parent.type == 6;
				if(isTuple || n.name) {
					return typeTest(n) && regex.test(isTuple ? n.key : n.name);
				}
				return typeTest(n);
			};
		} else {
			f = n => {
				let isTuple = n.parent.type == 6;
				if(isTuple || n.name) {
					return _isEq(isTuple ? n.key : n.name,qnameOrKey) && typeTest(n);
				}
				return typeTest(n);
			};
			f.__Accessor = qnameOrKey;
		}
	}
	f.__is_NodeTypeTest = true;
	return f;
}

export function element(qname) {
	return _nodeTest(_isElement,qname);
}

export function list(keyOrIndex) {
	return _nodeTest(_isList,keyOrIndex);
}

export function map() {
	return _nodeTest(_isMap);
}

export function processingInstruction() {
	return _nodeTest(_isPI);
}

export function comment() {
	return _nodeTest(_isComment);
}

function _attrGet(key,node){
	var entries;
	if (key !== null) {
		var val = node.attr(key);
		if (!val) return [];
		entries = [[key, val]];
	} else {
		entries = node.attrEntries();
	}
	return seq(entries).map(kv => node.vnode(node.ituple(kv[0], kv[1]), node.parent, node.depth + 1, node.indexInParent));
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
export function attribute($qname) {
	if(isUndef($qname)) $qname = "*";
	return exactlyOne($qname).map(qname => {
		var hasWildcard = /\*/.test(qname);
		// getter of attributes / pre-processor of attributes
		// TODO iterator!
		// filter of attributes
		var f;
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			//	attrEntries returns tuples
			f = n => _isAttribute(n) && regex.test(n.name);
			// no direct access
			qname = null;
		} else {
			// name check provided by directAccess
			f = n => _isAttribute(n);
		}
		return Axis(_attrGet.bind(null,qname),filter(f),2);
	});
}

export function text() {
	var f = n => _isText(n) && !!n.value;
	f.__is_NodeTypeTest = true;
	return seq(f);
}

export function node() {
	var f = n => _isElement(n) || (_isText(n) && !!n.value);
	f.__is_NodeTypeTest = true;
	return seq(f);
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
function Axis(g,f,type){
	return {
		__is_Axis: true,
		__type: type || 1,
		f:f,
		g:g
	};
}
export function child($f) {
	const cx = this;
	return zeroOrOne($f).map(f => {
		if(f.__is_NodeTypeTest){
			// this means it's a predicate, and the actual function should become a filter
			if(f.__Accessor) {
				// TODO this means we can try direct access on a node
			}
			f = filter(f);
		}
		return Axis(node => children.bind(cx)(node),f);
	});
}

export function siblingsOrSelf($node){
	var cx = this;
	return ensureDoc.bind(cx)($node).concatMap(node => children.bind(cx)(node.parent));
}

export function select($node, ...paths) {
	var cx = this;
	var boundEnsureDoc = ensureDoc.bind(cx);
	return seq(paths)
		.concatMap(path => seq(_axify(path)))
		// we're passing $node here, because we want to update it every iteration
		.map(path => $node => {
			// make sure all paths are funcs
			// TODO skip self
			var skipCompare = path.__type == 2 || path.__type == 3;
			var f = path.f;
			// rebind step function to the context
			var bound = function bound(n) {
				return path.g(boundEnsureDoc(n));
			};
			if (!skipCompare) f = compose(f, filter(_comparer()));
			return seq($node).concatMap(node => f(bound(node)));
		})
		.reduce(($node, changeFn) => changeFn($node),boundEnsureDoc($node))
		.concatAll();
}

function _comparer() {
	// dirty preserve state on function
	var f = function (node) {
		var has = f._checked.has(node);
		if (!has) f._checked.set(node,true);
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
function _axify($path){
	return seq($path).concatMap(path => {
		if(!path.__is_Axis){
			// process strings (can this be combined?)
			if (typeof path == "string") {
				var at = /^@/.test(path);
				if (at) path = path.substring(1);
				return at ? attribute(path) : child(element(path));
			} else if(typeof path == "function"){
				if(path.__is_NodeTypeTest) return child(path);
				return self(path);
			} else {
				return error("XXX","Unknown axis provided");
			}
		}
		return seq(path);
	});
}

export function isEmptyNode(node){
	node = ensureDoc.bind(this)(node);
	if(!isVNode(node)) return false;
	if(_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.count();
}

export function name($a) {
	if(isSeq($a)) return forEach($a,name);
	if(!isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}
