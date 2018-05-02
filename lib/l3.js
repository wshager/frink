"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.str2array = str2array;
exports.array2str = array2str;
exports.convert = convert;
exports.toL3 = toL3;
exports.fromL3Stream = fromL3Stream;
exports.toJS = toJS;

var _inode2 = require("./inode");

var inode = _interopRequireWildcard(_inode2);

var _vnode = require("./vnode");

var _access = require("./access");

var _seq = require("./seq");

var _util = require("./util");

var _type = require("./type");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function docAttrType(k) {
	switch (k) {
	case "DOCTYPE":
		return 11;
	default:
		return 7;
	}
}

function Nil() {}

Nil.prototype.valueOf = function () {
	return null;
};

Nil.prototype.toString = function() {
	return "null";
};

/**
 * Create a flat buffer from the document tree
 * @param  {VNode} doc The document
 * @return {ArrayBuffer}  A flat buffer
 */
function toL3($doc /*, to2D = false, schema = null*/) {
	var cx = this && this.vnode ? this : inode;
	return _access.getDoc.bind(cx)($doc).concatMap(function (doc) {
		//var schemaIter = schema ? docIter(schema) : new Nil();
		//var schemaEntry = schemaIter.next();
		return _access.vdoc.bind(cx)(_access.firstChild.bind(cx)(doc)).concatMap(function (node) {
			var type = node.type;
			if (type == 17) return [17];
			if (type == 1) {
				var d = [];
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = node.attrEntries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var attr = _step.value;
						Array.prototype.push.call(d, 2, attr[0], 3, attr[1]);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				return Array.prototype.push.call(d, 1, node.name);
			}
			if (type == 3) return [3, node.value];
			// if there's a schema entry and all schema props are equal then the node has a schema entry
			// else if there's a schema entry, the value is not there (which was assumed valid)
			// else write the node name + type
			// if indexInParent is not equal, we skipped a schema entry
			// TODO allow partial schema somewhere in the document tree
			//let nodeHasSchema = !schemaEntry.done && schemaEntry.depth == depth && schemaEntry.name == name;
			// if this node has a schema, continue with next, else skip and try with next entry
			//if (nodeHasSchema) schemaEntry = schemaIter.next();
			/*var nameIndex = 0;
   if (typeof name === "string" && !nodeHasSchema) {
   	if (!names[name]) {
   		names[name] = ++j;
   		out[i++] = 15;
   		i = str2array(name, out, i);
   	}
   	nameIndex = names[name];
   }
   // TODO use text for values unless there's a schema
   //  always store type
   out[i++] = type;
   out[i++] = depth;
   if (!nodeHasSchema && nameIndex) out[i++] = nameIndex;
   if (type == 1) {
   	// TODO how to serialize attrs with schema?
   	for (let attr of node.attrEntries()) {
   		let name = attr[0],
   			attrname = "@" + name;
   		if (!names[attrname]) {
   			names[attrname] = ++j;
   			out[i++] = 15;
   			i = str2array(name, out, i);
   		}
   		out[i++] = 2;
   		out[i++] = names[attrname];
   		i = str2array(attr[1], out, i);
   	}
   } else if (type == 3) {
   	i = str2array(node.value, out, i);
   } else if (type == 12) {
   	i = str2array(node.value + "", out, i);
   }*/
		});
	});
}
/*
export function fromL3(l3, schema = null) {
	var names = {},
		n = 15,
		parents = [],
		parentTypes = [],
		depth = 15;
	var cx = this && this.vnode ? this : inode;
	// TODO DOCTYPE / processing instructions
	var doc = cx.emptyINode(9, "#document", cx.emptyAttrMap());
	parents[depth] = doc;
	parentTypes[depth] = 9;
	var schemaIter = schema ? docIter(schema) : new Nil();
	var schemaEntry = schemaIter.next();
	const process = function (entry) {
		let type = entry[0];
		let hasSchema = false,
			skipSchema = false,
			schemaName;
		// TODO have attributes accept any type
		if (!type) {
			// assume schema
			hasSchema = true;
			type = schemaEntry.type;
			schemaName = schemaEntry.name;
		}
		if (type == 2) {
			let parent = parents[depth];
			let name = names[entry[1]];
			parent = cx.setAttribute(parent, name, array2str(entry, 2));
		} else if (type == 7 || type == 11) {
			doc = cx.setAttribute(doc, entry[1] == 11 ? 10 : 7, array2str(entry, 2));
		} else if (type == 15) {
			n++;
			names[n] = array2str(entry, 1);
		} else {
			depth = entry[1];
			let parent = parents[depth - 1];
			let parentType = parentTypes[depth - 1];
			let node, name, valIndex;
			if (type == 1 || type == 5 || type == 6) {
				name = names[entry[2]];
				if (name) {
					if (hasSchema && schemaName != name) skipSchema = true;
				} else {
					name = schemaName;
				}
				if (parents[depth]) {
					parents[depth] = cx.finalize(parents[depth]);
				}
				node = cx.emptyINode(type, name, cx.emptyAttrMap());
				parents[depth] = node;
				parentTypes[depth] = type;
			} else if (type == 3 || type == 12) {
				if (parentType == 1 || parentType == 9) {
					name = cx.count(parent);
					valIndex = 2;
				} else {
					name = names[entry[2]];
					if (name) {
						if (hasSchema && schemaName != name) skipSchema = true;
					} else {
						name = schemaName;
					}
					valIndex = 3;
				}
				let val = type == 3 ? array2str(entry, valIndex) : convert(array2str(entry, valIndex));
				node = cx.ivalue(type, name, val);
			}
			if (parent) parent = cx.push(parent, [name, node]);
		}
	};
	var entry = [];
	for (var i = 0, l = l3.length; i < l; i++) {
		var x = l3[i];
		if (x < 16 && x != 9 && x != 10 && x != 13) {
			if(i>0) process(entry);
			entry = [];
		}
		entry.push(x);
	}
	process(entry);
	return cx.finalize(parents[15]);
}
*/
var isLeaf = function isLeaf(type) {
	return type == 2 || type == 3 || type == 4 || type == 7 || type == 8 || type == 10 || type == 12 || type == 16;
};
var isBranch = function isBranch(type) {
	return type == 1 || type == 5 || type == 6 || type == 9 || type == 11 || type == 14 || type == 15;
};

function VNodeBuffer() {
	var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	this.nodes = nodes;
}

VNodeBuffer.prototype.add = function (v) {
	this.nodes.unshift(v);
};

VNodeBuffer.prototype.count = function () {
	return this.nodes.length;
};

VNodeBuffer.prototype.flush = function (sink) {
	var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

	var s = this.count();
	while (s >= count) {
		//console.log("FLUSH",s,count);
		sink.next(this.nodes.pop());
		--s;
	}
};

function Continuation(node) {
	this.node = node;
	node.__hasCall = node.count();
	this.depth = node.depth;
}
Continuation.prototype.type = 18;

function fromL3Stream(o) {
	var bufSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

	var _inode = inode.emptyINode(11);
	var d = new _vnode.VNode(inode, _inode, 11);
	var cx = this && "vnode" in this ? this : inode;
	var ndepth = 0,
	    stack = [],
	    open = [11],
	    parents = [d],
	    openTuples = {},
	    buffered = null,
	    buf = new VNodeBuffer();
	var checkStack = function checkStack() {
		var l = stack.length;
		if (!l) return;
		var type = stack[0];
		var ol = open.length - 1;
		var last = open[ol],
		    parent = parents[ol];
		var isClose = type == 17;
		// buffered is used to add attributes to elements before they're emitted
		// here buffered is released before anything else is processed (except attrs)
		if (last == 1 && buffered !== null && type != 2) {
			// console.log("buf",buffered.name);
			buf.add(buffered);
			buffered = null;
		}
		if (type == 18) {
			stack = [];
			return buf.add(new Continuation(parent));
		} else if (isClose) {
			open.pop();
			parents.pop();
			//console.log("closing",ndepth,parent.inode);
			--ndepth;
			stack = [];
			return buf.add(new _access.Step(parent));
		} else {
			var _inode = void 0,
			    name = void 0,
			    key = void 0,
			    _isBranch = isBranch(type);
			if (_isBranch) {
				ndepth++;
				switch (type) {
				case 1:
				{
					name = stack[1];
					_inode = { $type: type, $name: name, $children: [] };
					_inode.$attrs = {};
					if (last == 6) {
						// emit inode /w key
						key = openTuples[ndepth];
						//console.log("picked up tuple",ndepth,key);
						openTuples[ndepth] = undefined;
					}
					if (parent) parent.push([key, _inode]);
					open.push(type);
					// TODO use cx.vnode()
					var _depth = parent ? parent.depth + 1 : 1;
					var _node = new _vnode.VNode(cx, _inode, _inode.$type, name, key, isLeaf(type) ? _inode.valueOf() : null, parent, _depth, parent ? parent.count() : 0, parent ? parent.callCount() : 0);
					// buffer attributes
					buffered = _node;
					//console.log("opening element",ndepth,name, buffered);
					parents.push(_node);
					stack = [];
					return;
				}
				case 9:
					name = "#document";
					_inode = { $name: name, $children: [] };
					break;
				case 11:
					name = "#document-fragment";
					_inode = { $name: name, $children: [] };
					break;
				case 14:
					name = stack[1];
					_inode = { $name: name, $args: [], $call_args:[] };
					break;
				case 15:
					_inode = { $name: name, $args: [], $call_args:[] };
					break;
				case 5:
					_inode = []; //{$type:type,$children:[]};
					break;
				case 6:
					// never emit until all tuples are closed
					_inode = {};
					break;
				}
				if (last == 6) {
					// must be an open tuple
					key = openTuples[ndepth - 1];
					openTuples[ndepth - 1] = undefined;
					//console.log("picked up tuple",ndepth,key);
				}
				if (parent) {
					parent.push([key, _inode]);
				}
				open.push(type);
			} else {
				if (type == 2) {
					// new model:
					// - create tuple inode
					// - don't emit tuple, but tuple value /w key
					openTuples[ndepth] = stack[1];
					//console.log("opening tuple",ndepth,stack[1]);
					stack = [];
					return;
				} else {
					var value = stack[1];
					//try {
					if (type == 12) value = JSON.parse(value);
					//} catch(err) {
					//	console.log(err,value);
					//	value = "";
					//}
					_inode = value === null ? new Nil() : new value.constructor(value);
					if (openTuples[ndepth] !== undefined) {
						key = openTuples[ndepth];
						//console.log("picked up tuple",ndepth,key);
						// NOTE Don't put away your tuple Harry, they might come back...
						//openTuples[ndepth] = undefined;
						if (last == 6) {
							if (parent) {
								if(parent.has(key)) {
									parent.set(key,parent.get(key) + " "+ _inode);
								} else {
									parent.push([key, _inode]);
								}
							}
						} else if (last == 1) {
							parent.attr(key, value);
							stack = [];
							return;
						} else {
							// error
						}
					} else {
						if (parent) {
							parent.push([null, _inode]);
						}
					}
				}
			}
			stack = [];
			var depth = parent ? parent.depth + 1 : type == 9 || type == 11 ? 0 : 1;
			var node = new _vnode.VNode(cx, _inode, type, name, key, isLeaf(type) ? _inode.valueOf() : null, parent, depth, parent ? parent.count() : 0, parent ? parent.callCount() : 0);
			if (_isBranch) {
				parents.push(node);
			}
			//console.log("buf",node.name);
			buf.add(node);
		}
	};
	return (0, _seq.create)(function (sink) {
		return o.subscribe({
			next: function next(cur) {
				// this will be the new version of streaming-fromL3!
				if (typeof cur == "number") {
					try {
						checkStack();
					} catch (err) {
						return sink.error(err);
					}
					buf.flush(sink, bufSize);
				}
				stack.push(cur);
			},
			complete: function complete() {
				try {
					checkStack();
				} catch (err) {
					return sink.error(err);
				}
				// flush all
				buf.flush(sink);
				sink.complete();
			}
		});
	});
}

var constructormap = {
	1: "e",
	2: "a",
	3: "x",
	4: "r",
	5: "l",
	6: "m",
	7: "p",
	8: "c",
	12: "x",
	14: "f",
	15: "q"
};

function prefixAndName(str,defaultNS) {
	var hasPrefix = /:/.test(str);
	var prefix = hasPrefix ? str.replace(/^([^:]*):.*$/, "$1") : defaultNS;
	var name = !str ? "seq" : hasPrefix ? str.replace(/^[^:]*:(.*)$/, "$1") : str;
	return { prefix: prefix, name: name };
}

var normalizeName = function normalizeName(str,defaultNS) {
	const { prefix, name } = prefixAndName(str,defaultNS);
	return { prefix: prefix, name: _util.camelCase(name) };
};

function _printTail(ret,size=20) {
	return JSON.stringify(ret.text.substr(-size));
}

function _findInClosure(quotes,seqs,depth,value) {
	for(let i = depth; i > 0; i--) {
		if(quotes[i] && !quotes[i]["."] && quotes[i][value]) return true;
		if(seqs[i] && !seqs[i]["."] && seqs[i][value]) return true;
	}
}

const andOrRe = /^(n:)?(and|or)$/;
const ifRe = /^(n:)?if$/;
const andRe = /^(n:)?and$/;
const orRe = /^(n:)?or$/;

/*function detectAndOr(node) {
	return !!node.inode.$args.filter(x => {
		return andOrRe.test(x.$name);
	}).length;
}
const ifAndOrRe = /^(n\.)?(if|and|or)$/;
function detectIfAndOr(inode) {
	!!inode.$args.filter(x => {
		return x ? ifAndOrRe.test(x.$name) || (x.$args && x.$args.length ? detectIfAndOr(x) : false) : false;
	}).length;
}*/

const CALL = 0;
const MODULE = 1;
const IMPORT = 2;
const EXPORT = 3;
const PRIVATE = 4;
const VAR = 5;
const IF = 6;
const AND = 7;
const OR = 8;
const SEQ = 9;
const QUOT = 10;
const TYPESIG = 11;
const TYPESEQ = 12;
const THEN = 13;
const ELSE = 14;
const TYPED = 15;

const EXACTLY_ZERO = 0;
const EXACTLY_ONE = 1;
const ZERO_OR_ONE = 2;
const ZERO_OR_MORE = 3;
const ONE_OR_MORE = 4;
const MORE_THAN_ONE = 5;

class Datum {
	constructor(type,node,index) {
		this.$type = type;
		this.node = node;
		this.$index = index;
	}
	get index() {
		return this.$index;
	}
	get type() {
		return this.$type;
	}
	analyze() {

	}
	serialize() {
		var ret;
		if(this.type == 3) {
			ret = `"${this.node.value.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/&quot;/g,"\\\"").replace(/&apos;/,"'")}"`;
		} else if(this.type == 12) {
			ret = this.node.value+"";
		} else if(this.type == 8) {
			return "/*" + this.node.value + "*/\n";
		}
		return ret + (this.node.indexInParent < this.node.parent.count() ? "," : "");
	}
}

class Close {
	constructor(type,ref,index) {
		this.$type = type;
		this.$ref = ref;
		this.$index = index;
	}
	get index() {
		return this.$index;
	}
	get type() {
		return this.$type;
	}
	get ref() {
		return this.$ref;
	}
	analyze() {

	}
	serialize() {
		//var ret = this.$ref.ref.map(x => x.serialize()).join(",");
		var ref = this.$ref;
		var type = ref.type;
		//console.log("close",ref+"");
		var node = ref.node;
		var ret = "";
		if(type == VAR) {
			if(ref.chained) {
				ret = ")";
				if(ref.ref.length > 1) ret += ")";
			} else {
				ret =  "";
			}
		} else if(type == IF || type == AND || type == OR || (type == CALL && /true|false/.test(node.name))) {
			ret = "";
		} else if(type == THEN || type == ELSE) {
			ret = ref.ternary || ref.isElseIf ? "" : ";\n}";
		} else {
			//console.log("closing",ref+"");
			ret =  ")";
		}
		const hasIfBlockParent = ref.hasIfBlockParent;
		const sep = (type == IF || type == THEN || type == ELSE || type == AND || type == OR || ref.isIfTest) ?
			"" :
			hasIfBlockParent ? ";\n" : ref.infix == AND ? " && " : ref.infix == OR ? " || " : type == VAR && ref.isAssignment ? ref.hasIfAssigned ? "\n" :
				";\n" : ",";
		// FIXME write to correct place and propagate down
		const parentCount = node.parent.count();
		return ret + (node.indexInParent < parentCount ? sep : "") + (this.type == 18 ? "(" : "");
	}
}

const getOccurs = (nodeMap,annot) => {
	const occurs = nodeMap.get(annot.node.last()).node.name;
	switch(occurs) {
	case "empty":
		return 0;
	case "exactly-one":
		return 1;
	case "zero-or-one":
		return 2;
	case "zero-or-more":
		return 3;
	case "one-or-more":
		return 4;
	case "more-than-one":
		return 5;
	default:
	}
};

const sizeToOccurs = size => {
	if(size === 0) return EXACTLY_ZERO;
	if(size === 1) return EXACTLY_ONE;
	if(size > 1) return MORE_THAN_ONE;
};

const getDataType = (nodeMap,annot) => {
	const hasOccurs = annot.node.name == "occurs";
	const dataTypeRef = hasOccurs ? nodeMap.get(annot.node.first()) : annot;
	return {
		dataType: dataTypeRef.node.name,
		occurs: hasOccurs ? getOccurs(nodeMap,annot) : 1,
		dataTypeRef: dataTypeRef
	};
};

const expandDataType = (nodeMap,annot) => {
	let {dataType, occurs, dataTypeRef} = getDataType(nodeMap,annot);
	// get the actual data constructor by referencing the function in "type"
	// this should be safer than using eval
	// first handle inner types
	switch(dataType) {
	case "function":
		// TODO
		break;
	case "map": {
		const keyTypeRef = nodeMap.get(dataTypeRef.node.first());
		const valTypeRef = nodeMap.get(dataTypeRef.node.last());
		// create bound function
		// key + value (for Frink) should always be 1, if not error
		const keyAnnot = getDataType(nodeMap,keyTypeRef);
		annot.keyDataType = keyAnnot.dataType;
		if(keyAnnot.occurs != 1) throw new Error("Map key has wrong cardinality");
		const valAnnot = getDataType(nodeMap,valTypeRef);
		if(valAnnot.occurs != 1) throw new Error("Map value has wrong cardinality");
		annot.valDataType = valAnnot.dataType;
		break;
	}
	case "array": {
		const valTypeRef = nodeMap.get(dataTypeRef.node.last());
		// create bound function
		// value should always be 1, if not error
		const valAnnot = getDataType(nodeMap,valTypeRef);
		if(valAnnot.occurs != 1) throw new Error("Map value has wrong cardinality");
		// so... we can pass valType to all children, but that would be O(n)
		// instead pass it to the first and let that propagate
		annot.valDataType = valAnnot.dataType;
		break;
	}
	default:
	}
	annot.dataType = dataType;
	annot.occurs = occurs;
	return annot;
};

const subTypeOf = (p,b) => {
	if(p == "item" || b == "item") return true;
	if(p == "atomic") {
		switch(b) {
		case "atomic":
		case "boolean":
		case "string":
			return true;
		case "numeric":
			return subTypeOf("numeric",b);
		default:
			return false;
		}
	} else if(p == "numeric") {
		switch(b) {
		case "integer":
		case "number":
		case "double":
		case "float":
		case "decimal":
			return true;
		default:
			return false;
		}
	}
};

const matchOccurs = (s,t) => {
	if(t === EXACTLY_ONE) {
		return !(s === EXACTLY_ZERO || s === MORE_THAN_ONE);
	}
	if(t === ZERO_OR_ONE) {
		return s !== MORE_THAN_ONE;
	}
	if(t === ZERO_OR_MORE) {
		return true;
	}
	if(t === ONE_OR_MORE) {
		return s != EXACTLY_ZERO;
	}
};

const matchTypes = (s,t) => {
	if(subTypeOf(t,s) || s === t) return true;
};

const matchTypesOccurs = (src,trg) => {
	for(let i = 0; i < src.lengt; i++) {
		const s = src[i];
		const t = trg[i];
		if(!matchOccurs(s[1],t[1]) || !matchTypes(s[0],t[0])) {
			console.log(s,t);
			return false;
		}
	}
	return true;
};

const detectIfExternalRefs = (nodeMap,refs) => {
	const inIao = [];
	for(let i=0,l=refs.length;i<l;i++) {
		const x = refs[i];
		if(x.type == IF || x.type == AND || x.type == OR) {
			if(x.type == IF) {
			// FIXME dirty hack
				if(x.node.parent.name == "$") {
					const parentRef = nodeMap.get(x.node.parent.inode);
					parentRef.hasIfAssigned = true;
					x.assignee = x.node.parent.first();
				}
				x.ref[0].assignee = x.ref[1].assignee = x.assignee;
				x.ternary = !(x.ref[0].node.count() > 1 || x.ref[1].node.count() > 1);
				x.ref[0].ternary = x.ref[1].ternary = x.ternary;
				//console.log("IF",x.ternary,x.assignee);
			} else {
				const next = refs[i + 1];
				next.infix = x.type;
			}
			inIao.push(x);
		} else if(x.type == THEN) {
			//console.log("IAO closing",inIao[inIao.length - 1]+"");
			inIao.pop();
		} else if(x.type == 17 && (x.ref.type == AND || x.ref.type == OR)) {
			//console.log("IAO closing",inIao[inIao.length - 1]+"");
			inIao.pop();
		}
		if(inIao.length && x.type == VAR) {
			if(x.external) {
				const last = inIao[inIao.length - 1];
				//console.log("inIao",x+"",x.external,last+"");
				last.external = true;
			}
		}
	}
};

class Call {
	constructor(type,node,index) {
		this.$type = type;
		this.$node = node;
		this.$index = index;
		this.$refs = [];
		this.$closed = [];
		//console.log("added",this+"");
	}
	get index() {
		return this.$index;
	}
	set name(v) {
		this.$name = v;
	}
	get name() {
		return this.$name;
	}
	get node() {
		return this.$node;
	}
	set typesig(v) {
		this.$typesig = v;
	}
	get typesig() {
		return this.$typesig;
	}
	get type() {
		return this.$type;
	}
	set ref(index) {
		this.$refs.push(index);
	}
	get ref() {
		return this.$refs;
	}
	toString() {
		let name;
		switch (this.$type) {
		case 1:
			name = "Module";
			break;
		case 2:
			name = "Import";
			break;
		case 3:
			name = "Export";
			break;
		case 4:
			name = "Private";
			break;
		case 5:
			name = "Var";
			break;
		case 6:
			name = "If";
			break;
		case 7:
			name = "And";
			break;
		case 8:
			name = "Or";
			break;
		case 9:
			name = "Seq";
			break;
		case 10:
			name = "Quot";
			break;
		case 11:
			name = "TypeSig";
			break;
		case 12:
			name = "TypeSeq";
			break;
		case 13:
			name = "THEN";
			break;
		case 14:
			name = "ELSE";
			break;
		default:
			name = "Call";
		}
		return `${name}[${this.node.name},${this.$index},${this.name}]`;
	}
	serialize() {
		if(this.type == VAR) {
			const { prefix, name } = prefixAndName(this.name,"");
			const varName = (prefix ? prefix + "." : "$") + name;
			if(this.isAssignment) {
				if(!this.hasIfAssigned) return varName + " = " + (this.ref.length > 1 ? "n.replay(" : "");
				return "";
			} else {
				return (this.isIfAssigned ? ("$" +this.isIfAssigned + " = ") :
					this.isReturn ? "return " : "") + (this.annot ? "/*" + this.annot.dataType + "[" + this.annot.occurs + "]*/" : "") +
					varName;
				//(this.external ? "n.fromPromise($" + this.name + ")" :  "$" + this.name);
			}
		} else if(this.type == IF) {
			// TODO handle non-ternary if-block with assignment
			//if(this.node.parent.name == "$") this.assignee = this.node.parent.first();
			//console.log("IF",this.ternary,this.assignee);
			return (this.ternary ? "" : "if (") + (this.external ? "await " : "");
		} else if(this.type == AND || this.type == OR) {
			return (this.external ? "await " : "");
		} else if(this.type == THEN) {
			// TODO detect and / or
			return this.ternary ? " ? " : (") {\n" + (this.node.count() == 1 ? this.assignee ? ("$" + this.assignee + " = ") : "return " : ""));
		} else if(this.type == ELSE) {
			// TODO detect and / or
			return this.ternary ? " : " : (" else " + (this.isElseIf ? "" :
				"{\n" + (this.node.count() == 1 ? this.assignee ? ("$" + this.assignee + " = ") : "return " : "")));
		} else if(this.type == CALL) {
			if(this.node.name == "xq-version") return "// compiled from XQuery version " + this.ref[0].node.value + "\n";
			if(this.node.name == "true" || this.node.name == "false") return (this.isReturn ? "return " : "") + this.node.name;
			const { prefix, name } = normalizeName(this.node.name,"n");
			return (this.isReturn ? "return " : "") + (prefix ? prefix + "." : "") + name + "(" + (this.ref.length ? this.ref.map(x => x.serialize()).join(",") + ");" : "");
		} else if(this.type == SEQ) {
			// detect if AND/OR in ref
			let ret = this.isReturn ? "return " : "";
			if(this.isLetRet) {
				const assigs = Object.keys(this.assigMap).map(x => "$"+x);
				return ret + (assigs.length ? "let "+assigs.join(",")+";\n" : "") + this.ref.reduce((ret,x) => ret + x.serialize(),"");
			} else {
				const hasAndOr = this.ref.filter(x => x.type == AND || x.type == OR).length;
				return ret + (hasAndOr ? "(" : "n.seq(") + (this.ref.length ? this.ref.reduce((ret,x) => ret + x.serialize(),"") + ");" : "");
			}
		} else if(this.type == MODULE) {
			return "const " + this.node.first() + " = {};\n";
		} else if(this.type == EXPORT) {
			const { prefix, name } = normalizeName(this.node.first(),"n");
			return (prefix ? prefix + "." : "") + name + " = " +  this.ref.reduce((ret,x) => ret + x.serialize(),"") + ";\n\n";
		} else if(this.type == QUOT) {
			const typeseq = this.typesig.ref[0];
			const size = typeseq.ref.length;
			const refs = this.ref;
			const noIfAndOr = !refs.filter(x => (x.type == IF || x.type == AND || x.type == OR) && x.external).length;
			const assigs = Object.keys(this.assigMap).map(x => "$"+x);
			let txt = noIfAndOr ? "" : "async ";
			txt += "(" + Array.from(Array(size).keys()).map(x => "$" + (x + 1)) + ") => {\n";
			txt += "let " + assigs.join(",") + ";\n";
			// NOTE start from the nodes again, recurse down, but use info in ref
			//txt += this.node.map().serialize();
			txt = refs.reduce((txt,x) => txt + x.serialize(),txt);
			//if(count > 1) txt += ")";
			txt += "\n}";
			return txt;
		} else {
			return "";
		}
	}
	analyze(nodeMap,functionMap) {
		if(this.analyzed) return;
		this.analyzed = true;
		const type = this.type;
		if(type == EXPORT) {
			var firstRef = this.nodeMap.get(this.node.last());
			if(!firstRef) throw new Error("No ref found on EXPORT");
			if(this.typesig) {
				if(this.typesig.node.name == "function") {
					// NOTE handle param expansion on demand
					const typeseq = this.nodeMap.get(this.typesig.node.first());
					this.annot = expandDataType(this.nodeMap,this.nodeMap.get(this.typesig.node.last()));
					this.arity = typeseq.node.count();
					this.typeseq = typeseq;
					if(firstRef && firstRef.type == QUOT) {
						firstRef.typesig = this.typesig;
					}
				} else {
					this.annot = expandDataType(this.nodeMap,this.typesig);
				}
			}
			this.ref.forEach(x => {
				x.analyze(this.nodeMap,functionMap);
			});
			if(functionMap) {
				functionMap[this.name] = this;
			}
		} else if(type == QUOT) {
			const typesig = this.typesig;
			if(!typesig || typesig.node.name != "function") throw new Error("We're screwed");
			const typeseq = nodeMap.get(typesig.node.first());
			const refs = this.ref;
			const varsAndClose = refs.filter(x => x.type == VAR || (x.type == 17 && x.ref.type == VAR));
			// TODO walk over all vars and detect (re-)assignments and count references
			// FIXME take into account self-assigments..
			// TODO detect external vars by finding numbers among vars
			const params = {};
			const annots = typeseq.ref.map(expandDataType.bind(null,nodeMap));
			// carry over the "param" nature of a variable
			const assigMap = varsAndClose.reduce((assigMap,v) => {
				if(v.type == VAR) {
					if(v.node.count() == 1) {
						if(typeof v.name == "number") {
							params[v.node.parent.first().valueOf()] = v;
							v.annot = annots[v.name - 1];
							v.external = true;
						} else if(v.node.parent && v.node.parent.name == "$") {
							params[v.node.parent.first().valueOf()] = v;
						}
						if(v.name in assigMap) {
							assigMap[v.name].ref = v;
							if(params[v.name]) {
								const param = params[v.name];
								v.external = param.external;
								v.annot = param.annot;
								//console.log("ext",v+"", params[v.name]+"",v.external);
								//delete params[v.name];
							}
						}
					} else {
						v.isAssignment = true;
					}
				} else if(v.ref.isAssignment) {
					assigMap[v.ref.name] = v.ref;
				}
				return assigMap;
			},{});
			// try to determine if "if" references external param
			detectIfExternalRefs(nodeMap,refs);
			this.assigMap = assigMap;
			// mark last as "return"
			nodeMap.get(this.node.last()).isReturn = true;
			refs.forEach(r => {
				r.analyze(nodeMap,functionMap);
			});
		} else if(type == IF || type == THEN || type == ELSE) {
			const parentNode = this.node.parent;
			const parentRef = nodeMap.get(parentNode.inode);
			// mark sibling too
			// TODO check if test of type boolean, otherwise coerce
			const siblingRef = type == THEN ? nodeMap.get(parentNode.next(this.node)) : type == ELSE ? nodeMap.get(parentNode.previous(this.node)) : null;
			if(!parentRef.ternary) {
				this.ternary = false;
				if(siblingRef) siblingRef.ternary = false;
			}
			if(parentRef.assignee) {
				this.assignee = parentRef.assignee;
				if(siblingRef) siblingRef.assignee = parentRef.assignee;
			}
			// mark arguments
			if(type == IF) {
				const args = this.node.values();
				nodeMap.get(args[0]).isIfTest = true;
			} else if((type == THEN || type == ELSE) && !this.ternary) {
				const args = this.node.values();
				if(type == ELSE) {
					const firstArg = nodeMap.get(args[0]);
					if(firstArg.type == IF) this.isElseIf = true;
				}
				args.forEach(v => {
					const argRef = nodeMap.get(v);
					argRef.hasIfBlockParent = true;
				});
				if(this.assignee) {
					const lastArg = nodeMap.get(args[args.length - 1]);
					//if(firstArg.type == IF) this.isElseIf = true;
					lastArg.isIfAssigned = this.assignee;
				}
			}
		} else if(type == CALL) {
			if(nodeMap && functionMap) {
				const params = this.node.values().map(node => {
					const param = nodeMap.get(node);
					// we may always call analyze
					param.analyze(nodeMap,functionMap);
					if(param instanceof Call && !param.annot) {
						// still no annot?
						console.log(param+" has no annot");
						return;
					}

					return param instanceof Call ? [param.annot.dataType,param.annot.occurs] : [typeof param.node.value,1];
				}).filter(x => !!x);
				const { prefix, name } = prefixAndName(this.node.name,"fn");
				const arity = params.length;
				const qname = (prefix ? prefix + ":" : "") + name;
				let exportDef = functionMap[qname + "#" + arity];
				if(!exportDef) exportDef = functionMap[qname + "#N"];
				if(exportDef) {
					const fnNodeMap = exportDef.nodeMap;
					const typeseq = exportDef.typesig.ref[0];
					const defParams = typeseq.ref.map(expandDataType.bind(null,fnNodeMap)).map(annot => [annot.dataType,annot.occurs]);
					let end = defParams.length - 1;
					let last = defParams[end];
					if(last[0] === "...") {
						defParams.pop();
						end--;
						last = defParams[end];
						for(let i = end; i < arity; i++) defParams.push(last);
					}
					if(!matchTypesOccurs(params,defParams)) {
						throw new Error("Mismatch: "+qname+" => "+JSON.stringify(params)+" != "+JSON.stringify(defParams));
					}
					this.annot = exportDef.annot;
				} else {
					throw new Error("No definition found for function "+qname);
				}
			}
		} else if(type == SEQ) {
			nodeMap = nodeMap || this.nodeMap;
			if(!nodeMap) throw new Error("No nodeMap found on Seq");
			// try to determine seqType
			const ichildren = this.node.values();
			let dataType, size = ichildren.length;
			const refs = this.ref.length ? this.ref : ichildren.map(x => nodeMap.get(x));
			if(size > 0){
				const first = refs[0];
				if(first.node.name == "$") {
					this.isLetRet = true;
					const assigs = refs.filter(x => x.type == VAR && x.node.count() > 1);
					const assigMap = assigs.reduce((assigMap,v) => {
						v.isAssignment = true;
						assigMap[v.name] = v;
						return assigMap;
					},{});
					// try to determine if "if" references external param
					detectIfExternalRefs(nodeMap,refs);
					this.assigMap = assigMap;
				}
			}
			for(const node of ichildren) {
				const param = nodeMap.get(node);
				param.analyze(nodeMap,functionMap);
				// TODO check if contains item instead of atomic
				if(param instanceof Call) {
					if(param.annot){
						if(!dataType) {
							dataType = param.annot.dataType;
						} else if(dataType != param.annot.dataType) {
							dataType = "atomic";
						}
					}
				} else {
					if(!dataType) {
						dataType = typeof param.node.value;
					} else if(dataType != typeof param.node.value) {
						dataType = "atomic";
					}
				}
			}
			this.annot = {
				dataType:dataType,
				occurs:sizeToOccurs(size)
			};
		} else if(type == VAR) {
			// try to get type info from constants in scope
			if(functionMap) {
				const constant = functionMap[this.name];
				if(constant && constant.annot) {
					this.annot = constant.annot;
				} else {
					console.log("Constant " + this.name+" not found or no annotation on constant");
				}
			}
		}
	}
}
function bufferTopLevel(o) {
	return _seq.create($o => {
		var analysis = [];
		// TODO create document top!
		var curQuot, curModule, curTop;
		var nodeMap = new WeakMap();
		var index = -1;
		const addDatum = (type,node,index) => {
			const a = new Datum(type,node,index);
			nodeMap.set(node.inode,a);
			analysis.push(a);
			return a;
		};
		const addCall = (type,node,index) => {
			const a = new Call(type,node,index);
			nodeMap.set(node.inode,a);
			analysis.push(a);
			return a;
		};
		return o.subscribe({
			next: node => {
				index++;
				//console.log("index",index);
				// this will be the new version of streaming-fromL3!
				var type = node.type;
				//var curSeq;
				if (type == 17) {
					// TODO handle all cases:
					// - quotation with or without if
					// - let-ret-seq
					// - var at any position
					//ret.text = ret.text.replace(/,$/, "");
					// call quote with params, etc using closure!
					//const depth = node.node.depth;
					//const parent = node.node.parent;
					let cur = analysis.pop();
					if(!cur) {
						throw new Error("Too many closes in source file!");
					}
					//console.log("closing",cur+"");
					if(cur.type == 18) {
						cur = cur.ref;
						cur.chained = true;
						if(node.node != cur.node) {
							//console.log(cur.ref);
							cur = cur.ref;
						}
					}
					if(node.node == cur.node) {
						if(node.depth == 1) {
							// finally, add all top-level refs to module
							// FIXME if no module, create LOCAL placeHolder
							if(curModule && cur.type != MODULE) {
								//if(!curModule) {
								//	const node = new _vnode.VNode(inode, {$name:"$*",$args:["local"]}, 14, "$*", null, null, null, 0, 0, 0);
								//	curModule = addCall(MODULE,node,-1);
								//}
								curModule.ref = cur;
							}
							cur.nodeMap = nodeMap;
							if(cur.type == IMPORT){
								if(cur.node.count() < 3) return $o.next(cur);
								const path = cur.node.last().valueOf();
								if(path == "./fn" || path == "./op") return $o.next(cur);
								console.log("import",path);
								// TODO skip already imported
								return bufferTopLevel(parse("d:/workspace/raddle.xq/lib/"+path)).reduce(function (ret, a) {
									a.analyze();
									return ret;
								}).reduce((functionMap,fn) => {
									return fn.ref.reduce((functionMap,ref,i) => {
										if(i>0) {
											if(ref.typesig) {
												const typeseq = ref.typesig.ref[0].ref;
												let arity = ref.arity;
												if(arity) {
													const lastParam = typeseq[typeseq.length - 1];
													if(lastParam.node.name == "...") {
														arity = "N";
													}
												}
												functionMap[ref.name+"#"+arity] = ref;
											} else {
												functionMap[ref.name] = ref;
											}
										}
										return functionMap;
									},functionMap);
								},{}).subscribe(functionMap => {
									console.log(functionMap);
									$o.next(cur);
								});
							} else {
								$o.next(cur);
							}
							nodeMap = new WeakMap();
							curTop = null;
						} else if(cur.type == QUOT) {
							curQuot = null;
						} else if(curQuot) {
							if(!curQuot.ref.includes(cur)) throw new Error("Cur not in Quot");
							curQuot.ref = new Close(17,cur,index);
						} else if(curTop && curTop.ref.includes(cur)){
							curTop.ref = new Close(17,cur,index);
						}
					} else {
						console.log(node.node);
						throw new Error("cur not close: "+cur);
					}
				} else if (type == 18) {
					const cur = analysis.pop();
					const a = new Close(18,cur,index);
					nodeMap.set(node,a);
					analysis.push(a);
					if(curQuot) {
						//if(!curQuot.ref.includes(cur)) throw new Error("Cur not in Quot");
						curQuot.ref = a;
					}
				} else {
					let depth = node.depth;
					const len = analysis.length;
					let cur = len ? analysis[len - 1] : null;

					if (isBranch(type)) {
						switch (type) {
						case 1:
							break;
						case 11:
							console.log("doc!",node);
							break;
						case 14:
							{
								// TODO:
								// - create Analysis Object, add to stack, grouped by relevant sections
								// - populate Analysis:
								//   - Decl: a top-level declaration with it's type signature
								//   - Quotation: the quote belonging to the Decl
								//   - Let-Ret-Seq (FLOWR?)
								//   - Var: an assignment with the assigned value and (if possible) type; track refCount
								//   - Call: a call to a function (mark if chained ,FIXME change Call to Chained and handle properly)
								//   - Mark special calls: if/and/or
								// - load type signatures from calls in standard or ext libs
								// - check Var types where possible
								// - assigned can be full tree, can we keep it flat?
								let isVar = node.name && /^\$$/.test(node.name);
								if (isVar) {
									// TODO private
									const a = addCall(VAR,node,index);
									// for refCount, add VAR to QUOT and count all vars of same name (determine assignment or not)
									if(!curQuot) {
										// FIXME this means there's no body, so it's an RDL definition instead
										if(!curTop) throw new Error("Var encountered, but no open quotation or top-level declaration found, at "+index);
										curTop.ref = a;
									} else {
										curQuot.ref = a;
									}
								} else if(node.name == "xq-version") {
									//ret.text += "// transpiled from XQuery version ";
									if(depth > 1) throw new Error("XQ-version encountered below top-level");
									if(cur) throw new Error("Top-level XQ-version encountered, but previous level not closed");
									if(curQuot) throw new Error("Top-level XQ-version encountered, but previous quotation not closed");
									addCall(CALL,node,index);
								} else {
									// TODO handle Element
									if(!node.name) {
										// if quote, use return
										// TODO detect let-ret seq
										const isTypeSeq = cur && cur.type == TYPESIG;
										const a = addCall(isTypeSeq ? TYPESEQ : SEQ,node,index);
										if(isTypeSeq) {
											cur.ref = a;
										} else if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											curTop = a;
										}
									} else if (/^\$\*$/.test(node.name)) {
										//ret.text += "n.module($,";
										if(depth > 1) throw new Error("Module encountered below top-level");
										if(cur) throw new Error("Top-level module encountered, but previous level not closed");
										if(curQuot) throw new Error("Top-level module encountered, but previous quotation not closed");
										const a = addCall(MODULE,node,index);
										curModule = a;
									} else if (/^\$<$/.test(node.name)) {
										if(depth > 1) throw new Error("Import encountered below top-level");
										if(cur) throw new Error("Top-level import encountered, but previous level not closed");
										if(curQuot) throw new Error("Top-level import encountered, but previous quotation not closed");
										addCall(IMPORT,node,index);
									} else if (/^\$>$/.test(node.name)) {
										if(depth > 1) console.log(node);
										if(depth > 1) throw new Error("Export encountered below top-level at "+index+", depth "+depth);
										if(cur) throw new Error("Top-level export encountered, but previous level not closed");
										if(curQuot) throw new Error("Top-level export encountered, but previous quotation not closed");
										const a = addCall(EXPORT,node,index);
										curTop = a;
									} else if(ifRe.test(node.name)) {
										const a = addCall(IF,node,index);
										// TODO add to last QUOT
										if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											throw new Error("If encountered, but no open quotation or top level found");
										}
									} else if(andRe.test(node.name)) {
										const a = addCall(AND,node,index);
										if(cur.type == SEQ) cur.ref = a;
										if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											throw new Error("Add encountered, but no open quotation or top level found");
										}
									} else if(orRe.test(node.name)) {
										const a = addCall(OR,node,index);
										if(cur.type == SEQ) cur.ref = a;
										if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											throw new Error("Or encountered, but no open quotation or top level found");
										}
									} else {
										let a;
										if(cur) {
											if(cur.type == EXPORT && node.indexInParent == 2) {
												a = addCall(TYPESIG,node,index);
												cur.typesig = a;
											} else if(cur.type == TYPESEQ) {
												a = addCall(TYPESIG,node,index);
												cur.ref = a;
											} else if(cur.type == TYPESIG) {
												a = addCall(TYPESIG,node,index);
												cur.ref = a;
											}
										}
										if(!a) {
											if(node.name == "typed") {
												// add refs later
												a = addCall(TYPED,node,index);
											} else {
												a = addCall(CALL,node,index);
												if(curQuot) {
													curQuot.ref = a;
												} else if(curTop) {
													curTop.ref = a;
												} else {
													curTop = a;
												}
											}
										}
									}
								}
							}
							break;
						case 15:
							{
								if(cur.type == IF) {
									const a = addCall(node.indexInParent == 2 ? THEN : ELSE,node,index);
									cur.ref = a;
									curQuot.ref = a;
								} else {
									const a = addCall(QUOT,node,index);
									if(cur.type == EXPORT) {
										cur.ref = a;
									} else if(cur.type == TYPED) {
										// TODO handle inline function
										// remove the ref from its top
										a.typesig = nodeMap.get(cur.node.first());
										curQuot.ref = a;
									} else {
										console.log("no correct cur for Quot",cur+"");
									}
									curQuot = a;
								}
							}
							break;
						case 5:
						case 6:
							{
								addDatum(type,node,index);
							}
							break;
						}
					} else {
						var value = node.value;
						if(node.indexInParent == 1 && (cur.type == VAR || cur.type == EXPORT)) {
							if(!cur && curTop) cur = curTop;
							cur.name = value;
						} else {
							const a = new Datum(type,node,index);
							nodeMap.set(node.inode,a);
							if(curQuot) {
								curQuot.ref = a;
							} else if(curTop) {
								curTop.ref = a;
							} else if(cur) {
								cur.ref = a;
							} else {
								$o.next(a);
							}
						}
					}
				}
			},
			error: err => {
				$o.error(err);
			},
			complete:() => {
				$o.complete();
			}
		});
	});
}
function parse(path) {
	return _seq.create(o => {
		fs.readFile(path, "utf8", (err,ret) => {
			if(err) return o.error(err);
			const query = ret.toString();
			//console.log(query);
			fetch("http://127.0.0.1:8080/exist/apps/raddle.xq/tests/eval.xql?compat=rd&transpile=l3&path="+path,{
				method:"POST",
				headers:{
					"Accept": "application/json,text/plain",
					"Content-Type": "text/plain"
				},
				body:query
			})
				.then(r => {
					return r.json();
				})
				.then(ret => {
					fromL3Stream(_seq.from(ret)).subscribe(o);
				});
		});
	});
}
var fetch = require("node-fetch");
var fs = require("fs");
function toJS(o) {
	const def = "\"use strict\";\nconst n = require(\"../lib/index\"), array = require(\"../lib/array\"), map = require(\"../lib/map\"), local = {};\n";
	// load definitions
	const $fnMap = bufferTopLevel(parse("../raddled/fn.rdl")).reduce(function (ret, a) {
		a.analyze();
		return ret;
	}).merge(bufferTopLevel(parse("../raddled/n.rdl")).reduce(function (ret, a) {
		a.analyze();
		return ret;
	})).merge(bufferTopLevel(parse("../raddled/map.rdl")).reduce(function (ret, a) {
		a.analyze();
		return ret;
	})).merge(bufferTopLevel(parse("../raddled/array.rdl")).reduce(function (ret, a) {
		a.analyze();
		return ret;
	})).reduce((functionMap,fn) => {
		// fn is the module (because reduce default is first)
		return fn.ref.reduce((functionMap,ref,i) => {
			if(i>0) {
				if(ref.typesig) {
					const typeseq = ref.typesig.ref[0].ref;
					let arity = ref.arity;
					if(arity) {
						const lastParam = typeseq[typeseq.length - 1];
						if(lastParam.node.name == "...") {
							arity = "N";
						}
					}
					functionMap[ref.name+"#"+arity] = ref;
				} else {
					functionMap[ref.name] = ref;
				}
			}
			return functionMap;
		},functionMap);
	},{});
	return $fnMap.mergeMap(functionMap => {
		//console.log(functionMap);
		return bufferTopLevel(o).reduce(function (ret, a) {
			a.analyze(null,functionMap);
			ret.text += a.serialize();
			return ret;
		},{text:"",isModule:0})
			.map(x => {
			//console.log(x.text);
				let text = def+x.text.replace(/,$/, "");
				if(x.isModule) {
				// interop
					const prefix = x.modulePrefix;
					for(const k in x.module) {
						const ars = x.module[k];
						text += prefix + "." + k + " = (...$) => {\n";
						text += "const $len = $.length;";
						for(var arity of ars) {
							text += `if(process.env.debug) console.log("${prefix}.${k}",$len);\n`;
							text += `if($len == ${arity}) return n.fromPromise(${prefix}.${k}$${arity}.apply(null,$));\n`;
						}
						text += "};";
					}
					text += "module.exports = " + prefix;
				}
				return text;
			});
	});
}
