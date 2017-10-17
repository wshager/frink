import { ensureDoc } from "./doc";

import { compose, into, transform, forEach, filter, cat, foldLeft } from "./transducers";

import { seq, isSeq } from "./seq";

import { prettyXML } from "./pretty";

export function VNodeIterator(iter, parent, f){
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
	return { value: this.f(v.value,this.parent,this.indexInParent) };
};

export function Step(inode,name,parent,depth,indexInParent){
	this.inode = inode;
	this.name = name;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function(){
	return "Step {depth:" + this.depth + ", closes:" + this.name + "}";
};

/*
export function* docIter(node) {
	node = ensureDoc.bind(this)(node);
	yield node;
	while (node) {
		node = nextNode(node);
		if(node) yield node;
	}
}
*/
export function nextNode(node /* VNode */) {
	var type = node.type,
		inode = node.inode,
		parent = node.parent,
		indexInParent = node.indexInParent || 0;
	var depth = node.depth || 0;
	// FIXME improve check
	if(type != 17 && (type == 1 || type == 5  || type == 6 || type == 14) && node.count() === 0) {
		return new Step(inode, node.name, node.parent, depth, node.indexInParent);
	}
	if(type != 17 && node.count() > 0) {
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
			//throw new Error("Node "+parent.name+" hasn't been completely traversed. Found "+ indexInParent + ", contains "+ parent.count());
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
export function stringify(input){
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
	}
	return prettyXML(str);
}

export function firstChild(node) {
	// FIXME return root if doc (or something else?)
	var next = ensureDoc.bind(this)(node);
	if(node !== next) return next;
	// next becomes parent, node = firstChild
	node = next.first();
	if(node) return next.vnode(node,next,next.depth + 1, 0);
}

export function nextSibling(node){
	node = ensureDoc.bind(this)(node);
	var parent = node.parent;
	var next = parent.next(node);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if(next) return parent.vnode(next, parent, node.depth, node.indexInParent+1);
}

/*
export function* children(node){
	node = ensureDoc.bind(this)(node);
	var i = 0;
	for(var c of node.values()){
		if(c) yield node.vnode(c, node, node.depth + 1, i++);
	}
}
*/
export function getDoc(node) {
	node = ensureDoc.bind(this)(node);
	do {
		node = node.parent;
	} while(node.parent);
	return node;
}

export function lastChild(node){
	node = ensureDoc.bind(this)(node);
	var last = node.last();
	return node.vnode(last,node,node.depth+1, node.count() - 1);
}

export function parent(node) {
	if(!arguments.length) return Axis(parent);
	return node.parent ? seq(new VNodeIterator([node.parent.inode][Symbol.iterator](),node.parent.parent, node)) : seq();
}

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

export function self(f) {
	if(f.name !== "transForEach" && f.name !== "transFilter") f = forEach(f);
	return Axis(node => new Singleton(node), f, 3);
}

export function iter(node, f, cb) {
	// FIXME pass doc?
	var i=0,prev;
	if(!f) f = (node) => {prev = node;};
	node = ensureDoc.bind(this)(node);
	f(node,i++);
	while (node) {
		node = nextNode(node);
		if(node) {
			f(node,i++);
		}
	}
	if(cb) cb();
	//return prev;
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

// TODO convert qname to integer when parent is array
function _nodeTest(type,qname) {
	var f;
	if (qname === undefined) {
		f = type;
	} else {
		var hasWildcard = /\*/.test(qname);
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			f = n => type(n) && regex.test(n.name);
		} else {
			//return _seq.seq(_get(qname, 1), _transducers.filter(_isElement));
			f = n => n.name === qname && type(n);
			f.__Accessor = qname;
		}
	}
	f.__is_NodeTypeTest = true;
	return f;
}

export function element(qname) {
	return _nodeTest(_isElement,qname);
}

export function list() {
	return _nodeTest(_isList);
}

/*export function map() {
	return _nodeTest(_isMap);
}*/

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
	return into(entries, kv => node.vnode(node.ituple(kv[0], kv[1]), node.parent, node.depth + 1, node.indexInParent),seq())[Symbol.iterator]();
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
export function attribute(qname) {
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
}

export function text() {
	var f = n => _isText(n) && !!n.value;
	f.__is_NodeTypeTest = true;
	return f;
}

export function node() {
	var f = n => _isElement(n) || (_isText(n) && !!n.value);
	f.__is_NodeTypeTest = true;
	return f;
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
export function child(f) {
	if(f.__is_NodeTypeTest){
		// this means it's a predicate, and the actual function should become a filter
		if(f.__Accessor) {
			// TODO this means we can try direct access on a node
		}
		f = filter(f);
	}
	return Axis(node => node[Symbol.iterator](),f);
}

const _isSiblingIterator = n => !!n && n.__is_SiblingIterator;

const isVNodeIterator = n => !!n && n.__is_VNodeIterator;

function SiblingIterator(inode, parent, depth, indexInParent, dir){
	this.inode = inode;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
	this.dir = dir;
	this.__is_SiblingIterator = true;
}

SiblingIterator.prototype.next = function(){
	var v = this.dir.call(this.parent.inode,this.name,this.inode);
	this.index++;
	if (!v) return DONE;
	this.inode = v;
	return { value: this.parent.vnode(v, this.parent, this.depth, this.indexInParent) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
	return this;
};

export function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = ensureDoc.bind(this)(node);
	return seq(new SiblingIterator(node.inode, node.parent, node.depth, node.indexInParent));
}

/*function* _combinedIter(iters, f) {
	for(var x of iters) {
		var next;
		// expect everything to be a faux iterator
		while(next = f(x).next(), !next.done) {
			yield next.value;
		}
	}
}*/

function CombinedIterator(iters,f){
	this.iter = f(iters.shift());
	this.iters = iters;
	this.f = f;
	this.index = 0;
}

CombinedIterator.prototype.next = function() {
	if (!this.iter) return DONE;
	var v = this.iter.next();
	if (!v || v.done) {
		if(this.iters.length) {
			this.iter = this.f(this.iters.shift());
			return this.next();
		}
		return DONE;
	}
	return v;
};

function _combinedIter(iters, f) {
	return new CombinedIterator(iters,f);
}

// make sure all paths are transducer-funcs
export function select(node, ...paths) {
	// usually we have a sequence
	// TODO make lazy:
	// - combine iterators for each node seq to one iterator
	// - bind the composed function to the combined iterator
	// - combine the combined iterator
	var cur = node;
	var bed = ensureDoc.bind(this);
	while (paths.length > 0) {
		let path = paths.shift();
		path = _axify(path);
		// TODO skip self
		var skipCompare = path.__type == 2 || path.__type == 3;
		var f = path.f;
		// rebind step function to the context
		var bound = n => path.g(bed(n));
		if (!skipCompare) f = compose(f, filter(_comparer()));
		var x = isSeq(cur) ? _combinedIter(cur.toArray(), bound) : bound(cur);
		cur = into(x, f,seq());
	}
	return cur;
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
function _axify(path){
	if(!path.__is_Axis){
		// process strings (can this be combined?)
		if (typeof path == "string") {
			var at = /^@/.test(path);
			if (at) path = path.substring(1);
			return at ? attribute(path) : child(element(path));
		} else if(typeof path == "function"){
			return self(path);
		} else {
			// TODO throw error
		}
	}
	return path;
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
