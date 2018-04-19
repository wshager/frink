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
					try {
						if (type == 12) value = JSON.parse(value);
					} catch(err) {
						console.log(err,value);
						value = "";
					}
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

var normalizeName = function normalizeName(str,defaultNS) {
	var hasPrefix = /:/.test(str);
	var prefix = hasPrefix ? str.replace(/^([^:]*):.*$/, "$1") : defaultNS;
	var name = !str ? "seq" : (0, _util.camelCase)(hasPrefix ? str.replace(/^[^:]*:(.*)$/, "$1") : str);
	return { prefix: prefix, name: name };
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

const andOrRe = /^(n\.)?(and|or)$/;
const ifRe = /^(n\.)?if$/;
const andRe = /^(n\.)?and$/;
const orRe = /^(n\.)?or$/;

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

class Datum {
	constructor(type,node,index) {
		this.$type = type;
		this.$node = node;
		this.$index = index;
	}
	get index() {
		return this.$index;
	}
	get type() {
		return this.$type;
	}
	serialize() {
		var ret;
		if(this.type == 3) {
			ret = `"${this.$node.value.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/&quot;/g,"\\\"").replace(/&apos;/,"'")}"`;
		} else if(this.type == 12) {
			ret = this.$node.value+"";
		}
		return ret + (this.$node.indexInParent < this.$node.parent.count() ? "," : "");
	}
}

class Close {
	constructor(ref,index) {
		this.$type = 17;
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
	serialize() {
		//var ret = this.$ref.ref.map(x => x.serialize()).join(",");
		var ref = this.$ref;
		var type = ref.type;
		//console.log("close",ref+"");
		var node = ref.$node;
		var ret;
		if(type == VAR) {
			if(node.count() > 1 && !ref.hasIfBlock) {
				ret = ")";
				if(ref.ref.length > 1) ret += ")";
			} else {
				ret =  "";
			}
		} else if(type == IF || type == AND || type == OR || (type == CALL && /true|false/.test(node.name))) {
			ret = "";
		} else if(type == THEN || type == ELSE) {
			ret = ref.ternary ? "" : "\n}";
		} else {
			console.log("closing",ref+"");
			ret =  ")";
		}
		const parentRef = node.parent.__ref;
		const parentType = parentRef.type;
		const ifBlock = (parentType == THEN || parentType == ELSE) && !parentRef.ternary;
		const sep = (type == IF || type == THEN || type == ELSE || type == AND || type == OR) ?
			"" :
			ifBlock ? ";\n" : parentType == AND ? " && " : parentType == OR ? " || " : parentType == QUOT ?
				type == 5 && ref.hasIfBlock ? "\n" :
					";\n" : ",";
		if(parentType == THEN || parentType == ELSE) console.log("THENELSE",parentType,parentRef.assignee);

		const lastSep = sep + ((parentType == THEN || parentType == ELSE) && parentRef.assignee ? "$" + parentRef.assignee + " = " : parentType == QUOT ? "return " : "");
		const parentCount = node.parent.count() - 1;
		const endSep = ifBlock ? ";" : "";
		return ret + (node.indexInParent < parentCount ? sep : node.indexInParent == parentCount ? lastSep : endSep);
	}
}

class Call {
	constructor(type,node,index) {
		this.$type = type;
		this.$node = node;
		this.$index = index;
		this.$refs = [];
		this.$closed = [];
		node.__ref = this;
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
		return `${name}[${this.$node.name},${this.$index},${this.$name}]`;
	}
	serialize(opt) {
		if(this.type == VAR) {
			if(this.$node.count() > 1) {
				if(!this.hasIfBlock || opt) return "$" + this.name + " = " + (this.ref.length > 1 ? "replay(" : "") + "fromPromise(";
				return "";
			} else {
				return "$" + this.name;
			}
		} else if(this.type == IF) {
			// TODO handle non-ternary if-block with assignment
			//if(this.$node.parent.name == "$") this.assignee = this.$node.parent.first();
			//console.log("IF",this.ternary,this.assignee);
			return (this.ternary ? "" : "if (") + (this.external ? "await " : "");
		} else if(this.type == AND || this.type == OR) {
			return (this.external ? "await " : "");
		} else if(this.type == THEN) {
			// TODO detect and / or
			return this.ternary ? " ? " : ") {\n";
		} else if(this.type == ELSE) {
			// TODO detect and / or
			return this.ternary ? " : " : " else {\n";
		} else if(this.type == CALL) {
			if(this.$node.name == "true" || this.$node.name == "false") return this.$node.name;
			const { prefix, name } = normalizeName(this.$node.name,"n");
			return (prefix ? prefix + "." : "") + name + "(";
		} else if(this.type == SEQ) {
			// detect if AND/OR in ref
			const hasAndOr = this.ref.filter(x => x.type == AND || x.type == OR).length;
			return hasAndOr ? "(" : "n.seq(";
		} else if(this.type == MODULE) {
			return "const " + this.$node.first() + " = {};\n";
		} else if(this.type == EXPORT) {
			const { prefix, name } = normalizeName(this.$node.first(),"n");
			this.ref[0].typesig = this.typesig;
			return (prefix ? prefix + "." : "") + name + " = " + this.ref[0].serialize();
		} else if(this.type == QUOT) {
			const typesig = this.typesig;
			if(!typesig || typesig.$node.name != "function") throw new Error("We're screwed");
			const typeseq = typesig.ref[0];
			const size = typeseq.ref.length;
			const refs = this.ref;
			const varsAndClose = refs.filter(x => x.type == VAR || (x.type == 17 && x.ref.type == VAR));
			// TODO walk over all vars and detect (re-)assignments and count references
			// FIXME take into account self-assigments..
			// TODO detect external vars by finding numbers among vars
			const params = {};
			const assigMap = varsAndClose.reduce((assigMap,v) => {
				if(v.type == VAR) {
					if(v.$node.count() == 1) {
						if(typeof v.name == "number") {
							params[v.$node.parent.first().valueOf()] = v;
							v.external = true;
						} else if(v.$node.parent && v.$node.parent.name == "$") {
							params[v.$node.parent.first().valueOf()] = v;
						}
						if(v.name in assigMap) {
							assigMap[v.name].ref = v;
							if(params[v.name]) {
								v.external = params[v.name].external;
								//console.log("ext",v+"", params[v.name]+"",v.external);
								delete params[v.name];
							}
						}
					}
				} else if(v.ref.$node.count() > 1) {
					assigMap[v.ref.name] = v.ref;
				}
				return assigMap;
			},{});
			// try to determine if "if" references external param
			let inIao = [];
			for(var x of refs) {
				if(x.type == IF || x.type == AND || x.type == OR) {
					if(x.type == IF) {
						// FIXME dirty hack
						if(x.$node.parent.name == "$") {
							x.$node.parent.__ref.hasIfBlock = true;
							x.assignee = x.$node.parent.first();
						}
						x.ref[0].assignee = x.ref[1].assignee = x.assignee;
						x.ternary = !(x.ref[0].$node.count() > 1 || x.ref[1].$node.count() > 1);
						x.ref[0].ternary = x.ref[1].ternary = x.ternary;
						console.log("IF",x.ternary,x.assignee);
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
			const noIfAndOr = !refs.filter(x => (x.type == IF || x.type == AND || x.type == OR) && x.external).length;
			const assigs = Object.keys(assigMap).map(x => "$"+x);//vars.filter(x => x.$node.count() > 1);
			let txt = noIfAndOr ? "" : "async ";
			txt += "(" + Array.from(Array(size).keys()).map(x => "$" + (x + 1)) + ") => {\n";
			txt += "let " + assigs.join(",") + ";\n";
			//const count = this.$node.count();
			//if(count > 1) txt += "(";
			// NOTE start from the nodes again, recurse down, but use info in ref
			//txt += this.$node.map().serialize();
			txt = refs.reduce((txt,x) => txt + x.serialize(),txt);
			//if(count > 1) txt += ")";
			txt += ";\n}";
			return txt;
		} else {
			return "";
		}
	}
}

function toJS(o) {
	const def = "\"use strict\";\nconst n = require(\"../lib/index\"), array = require(\"../lib/array\"), map = require(\"../lib/map\");\n";
	var analysis = [];
	var curQuot;
	return o.reduce(function (ret, node, index) {
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
			const cur = analysis.pop();
			//console.log("closing",cur+"");
			if(node.node == cur.$node) {
				if(cur.type == QUOT) {
					curQuot = null;
					// FIXME if last is EXPORT, let that handle serialization
					const last = analysis[analysis.length - 1];
					if(last.type == EXPORT) {
						console.log(last.serialize());
					}
				} else if(cur.type == MODULE) {
					console.log(cur.serialize());
				} else if(curQuot) {
					if(!curQuot.ref.includes(cur)) throw new Error("Cur not in Quot");
					curQuot.ref = new Close(cur,index);
				}
			} else {
				throw new Error("cur not close",cur+"");
			}
			/*let ifCases = ret.ifCases[depth - 1];
			if(ret.seqs[depth]) {
				// TODO close as let-ret or seq
				//console.log("close seq",_printTail(ret));
				//if(ret.seqs[depth]["."]) {
				ret.text += ")";
				//} else {
				//	ret.text += ")";
				//}
				if(parent && !andOrRe.test(parent.name) && parent.count() > node.indexInParent) ret.text += ",";
				ret.seqs[depth] = null;
				//if(ifCases) {
				//console.log("found ifCases in seq",ifCases,_printTail(ret));
				//ret.text += ", test => { if (test) ";
				//}
			} else if(ret.quotes[depth]) {
				//console.log(ret.quotes[depth]);
				if(ifCases) {
					//console.log("found ifCases in quote",depth,ifCases,_printTail(ret));
					//ret.text += "}";
				} else {
					ret.text += "})";
					if(depth > 2) {
						ret.text += ".bind($)";
					}
				}
				ret.quotes[depth] = null;
			} else if(ret.vars[depth]) {
				const ifCases = ret.ifCases[depth - 1];
				//console.log("found vars",_printTail(ret));
				const parentHasCall = parent && parent.__hasCall;
				const count = parentHasCall ? parent.callCount() : parent.count();
				const index = parentHasCall ? node.node.indexInCall : node.node.indexInParent;
				//console.log(count,index);
				ret.text += ")";
				if(!andOrRe.test(parent.name) && count > index && !ifCases) {
					ret.text += ",";
				}
				ret.vars[depth] = null;
			} else if(ret.ifCases[depth] == 3) {
				//const ifCases = ret.ifCases[depth - 1];
				//let vars = ret.quotes[depth - 2];
				//let last = vars ? vars["$last"] : null;
				//console.log("close if",_printTail(ret));
				//ret.text += last ? "},$"+last+")" : "})";
				ret.text += ")";
				if(parent && parent.count() > node.indexInParent) {
					ret.text += ",";
				}
				ret.ifCases[depth] = 0;
			} else if(ifCases == 1) {
				//console.log("found ifCases",ifCases,_printTail(ret));
				// make sure we close callers in ifCase
				if(node.node.callCount()) ret.text += ")";
				//ret.text += ifCases == 1 ? "), test => { if (test) " : "}";
				//if(ret.ifCases == 2) ret.ifCases = 0;
			} else {
				if(ret.seqs[depth - 1] && ret.seqs[depth - 1]["$"]) {
					//console.log("found var in seq",_printTail(ret));
					ret.text += "),\n";
				} else if(ret.quotes[depth - 1] && ret.quotes[depth - 1]["$"]) {
					//console.log("found var in quote",_printTail(ret));
					ret.text += "),\n";
				} else {
					if(ret.quotes[depth - 1] && ret.quotes[depth - 1]["."]) {
						//console.log("quote already closed",_printTail(ret));
						ret.text += ")";
					} else if(ret.seqs[depth - 1] && ret.seqs[depth - 1]["."]) {
						//console.log("seqs already closed",_printTail(ret));
						ret.text += ")";
					} else if((ret.isModule && depth == 1)) {
						//console.log("normal close when isModule",_printTail(ret));
						// TODO don't add paren if untyped (or move to parser)
						if(ret.isModule == node.node.indexInParent){
							ret.text += ";\n";
						} else {
							ret.text += ");\n";
						}
					} else {
						//console.log("normal close",_printTail(ret));
						if(node.node.name == "xq-version") {
							ret.text += "\n";
						} else {
							ret.text += ")";
							const ifCases = ret.ifCases[depth - 1];
							//if(!parent) console.log("NO PARENT",_printTail(ret));
							const parentHasCall = parent && parent.__hasCall;
							const count = !parent ? 0 : parentHasCall ? parent.callCount() : parent.count();
							const index = !parent ? 0 : parentHasCall ? node.node.indexInCall : node.node.indexInParent;
							if(parent && andOrRe.test(parent.name) && !ifCases) {
								//ret.text += ")";
							} else
							if(count > index && !ifCases) {
								ret.text += ",";
							}
						}
					}
				}
			}*/
		} else if (type == 18) {
			let depth = node.node.depth;
			ret.text = ret.text.replace(/,$/, "");
			//console.log("hasCall",_printTail(ret),node.node.count());
			// TODO close other things?
			if(ret.vars[depth]) {
				//console.log("found vars",ret.vars[depth]);
				ret.vars[depth] = null;
			}
			ret.text += ").call($";
			// FIXME this may not be correct...
			if(node.node.parent.count()) ret.text += ",";
		} else {
			let depth = node.depth;
			const len = analysis.length;
			const cur = len ? analysis[len - 1] : null;

			if (isBranch(type)) {
				switch (type) {
				case 1:
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
						/*const hasAndOr = node.parent && andOrRe.test(node.parent.name);
						if(hasAndOr) {
							const index = node.indexInParent;
							if(/^(n\.)?and$/.test(node.parent.name)) {
								if(index == 2) ret.text += ") && await n.when(";
							}
							if(/^(n\.)?or$/.test(node.parent.name)) {
								if(index == 2) ret.text += ") || await n.when(";
							}
						}*/
						let isVar = node.name && /^\$$/.test(node.name);
						if (isVar) {
							//let isAss = node.count() > 1;
							//var parentCount = node.parent ? node.parent.count() : 0;
							//if(depth == 1) console.log(node.indexInParent,node.parent.count());
							//var isPrivate = depth == 1 && (ret.isModule || node.indexInParent < parentCount);
							/*if(ret.quotes[depth - 1] && isAss) {
								ret.quotes[depth - 1]["$"] = true;
							} else if(ret.seqs[depth - 1] && isAss) {
								//console.log("open let-ret-seq",depth-1,_printTail(ret));
								// if not already let-ret-seq, write it
								if(!ret.seqs[depth - 1]["$"]) ret.text += "(";
								ret.seqs[depth - 1]["$"] = true;

							} else {
								// NOTE keep track of vars
								//console.log("open vars",depth);
								ret.vars[depth] = {"$":true};
							}*/
							// TODO private
							const a = new Call(VAR,node,index);
							// for refCount, add VAR to QUOT and count all vars of same name (determine assignment or not)
							if(!curQuot) {
								//console.log(cur+"");
								throw new Error("Var encounted, but no open quotation found");
							}
							curQuot.ref = a;
							analysis.push(a);
							//ret.text += isDecl ? "" : "$(";
						} else if(node.name == "xq-version") {
							//ret.text += "// transpiled from XQuery version ";
							if(depth > 1) throw new Error("XQ-version encountered below top-level");
							if(cur) throw new Error("Top-level XQ-version encountered, but previous level not closed");
							if(curQuot) throw new Error("Top-level XQ-version encountered, but previous quotation not closed");
							const a = new Call(0,node,index);
							analysis.push(a);
						} else {
							/*if(ret.quotes[depth - 1]) {
								//ret.text += ",\n";
								if(ret.quotes[depth - 1]["$"]) {
									ret.quotes[depth - 1]["$"] = false;
									ret.quotes[depth - 1]["."] = true;
								}
							}
							if(ret.seqs[depth - 1] && ret.seqs[depth - 1]["$"]) {
								//let ifCases = ret.ifCases[depth - 1];
								//if(!ifCases || ifCases != 1) ret.text += ",\n";
								ret.seqs[depth - 1]["$"] = false;
								ret.seqs[depth - 1]["."] = true;
							}*/
							// TODO handle Element
							if(!node.name) {
								// if quote, use return
								// TODO detect let-ret seq
								const isTypeSeq = cur.type == TYPESIG;
								const a = new Call(isTypeSeq ? TYPESEQ : SEQ,node,index);
								if(isTypeSeq) {
									cur.ref = a;
								} else {
									curQuot.ref = a;
								}
								analysis.push(a);
							} else if (/^\$\*$/.test(node.name)) {
								//ret.text += "n.module($,";
								if(depth > 1) throw new Error("Module encountered below top-level");
								if(cur) throw new Error("Top-level module encountered, but previous level not closed");
								if(curQuot) throw new Error("Top-level module encountered, but previous quotation not closed");

								const a = new Call(MODULE,node,index);
								analysis.push(a);
							} else if (/^\$<$/.test(node.name)) {
								if(depth > 1) throw new Error("Import encountered below top-level");
								if(cur) throw new Error("Top-level import encountered, but previous level not closed");
								if(curQuot) throw new Error("Top-level import encountered, but previous quotation not closed");

								const a = new Call(IMPORT,node,index);
								analysis.push(a);
							} else if (/^\$>$/.test(node.name)) {
								//ret.text += "n.export($,";
								if(depth > 1) throw new Error("Export encountered below top-level");
								if(cur) throw new Error("Top-level export encountered, but previous level not closed");
								if(curQuot) throw new Error("Top-level export encountered, but previous quotation not closed");
								const a = new Call(EXPORT,node,index);
								analysis.push(a);
							} else if(ifRe.test(node.name)) {
								//console.log("if opened",_printTail(ret));
								//ret.text += detectAndOr(node) ? "(" : "await n.when(";
								//ret.ifCases[depth] = 1;
								//} else if(/^\$\.$/.test(node.name)) {
								//	ret.text += "n.private($,";
								const a = new Call(IF,node,index);
								// TODO add to last QUOT
								if(!curQuot) throw new Error("If encountered, but no open quotation found");
								curQuot.ref = a;
								analysis.push(a);
							} else if(andRe.test(node.name)) {
								const a = new Call(AND,node,index);
								if(!curQuot) throw new Error("And encountered, but no open quotation found");
								if(cur.type == SEQ) cur.ref = a;
								curQuot.ref = a;
								analysis.push(a);
							} else if(orRe.test(node.name)) {
								const a = new Call(OR,node,index);
								if(!curQuot) throw new Error("Or encountered, but no open quotation found");
								if(cur.type == SEQ) cur.ref = a;
								curQuot.ref = a;
								analysis.push(a);
							} else {
								if(cur.type == EXPORT) {
									const a = new Call(TYPESIG,node,index);
									analysis.push(a);
									cur.typesig = a;
								} else if(cur.type == TYPESEQ) {
									const a = new Call(TYPESIG,node,index);
									analysis.push(a);
									cur.ref = a;
								} else if(cur.type == TYPESIG) {
									const a = new Call(TYPESIG,node,index);
									analysis.push(a);
									cur.ref = a;
								} else {
									const a = new Call(CALL,node,index);
									analysis.push(a);
									if(!curQuot) throw new Error("Call encountered, but no open quotation found");
									curQuot.ref = a;
								}
							}
						}

					}
					break;
				case 15:
					{
						/*let depth = node.depth;
						ret.quotes[depth] = {};
						//console.log("open quote",depth,ret.ifCases,_printTail(ret));
						//let qname = isTuple ? stack[2] : stack[1];
						//qname = /[$:]/g.test(qname) ? qname.replace(/:/, ".") : qname;
						let ifCases = ret.ifCases[depth - 1];
						if(ifCases) {
							//console.log("found ifCases for new quote",ifCases,_printTail(ret));
							//ret.text = ret.text.replace(/,$/, "");
							if(ifCases == 1) {
								//let vars = ret.quotes[depth - 3];
								//let last = vars ? vars["$last"] : null;
								ret.text += ifCases == 1 ? ")) ?\n (" : "";
							} else if(ifCases == 2) {
								ret.text += ") :\n (";
							}
							ret.ifCases[depth - 1]++;
						} else {
							//ret.text += "(...a) => ($ = n.frame(a,$),";
							ret.text += "(async ";
							//if(detectIfAndOr(node.inode)) ret.text += "async ";
							ret.text += "function(...$) {\n$ = n.frame($";
							if(depth > 2) ret.text += ",this";
							ret.text += ");\nreturn ";
						}
					}*/
						let a;
						if(cur.type == IF) {
							a = new Call(node.indexInParent == 2 ? THEN : ELSE,node,index);
							cur.ref = a;
							curQuot.ref = a;
						} else {
							a = new Call(QUOT,node,index);
							curQuot = a;
							if(cur.type == EXPORT) {
								cur.ref = a;
							} else {
								console.log("Quot found cur not EXPORT",cur+"");
							}
						}
						analysis.push(a);
					}
					break;
				case 5:
					{
						const a = new Datum(type,node,index);
						analysis.push(a);
					}
					break;
				case 6:
					{
						const a = new Datum(type,node,index);
						analysis.push(a);
					}
					break;
				}
			} else {
				var value = node.value;
				/*let depth = node.depth;
				if (type == 8) {
					let hasComma = /,$/.test(ret.text);
					if(hasComma) ret.text = ret.text.replace(/,$/, "");

					if(hasComma && node.indexInParent > 1 && node.parent.count() > node.indexInParent) ret.text += ",";
				} else if (type == 4) {
					const { prefix, name } = normalizeName(value);
					ret.text += prefix + "." + name.replace(/#[0-9]$/,"");
					if(node.parent.count() > node.indexInParent) ret.text += ",";
				} else if (ret.isDecl) {
					var _normalizeName2 = normalizeName(value,"n"),
					    _prefix = _normalizeName2.prefix,
					    _name = _normalizeName2.name;

					//ret.modules[_prefix] |= 0;
					//ret.modules[_prefix]++;
					value = _prefix + "." + _name + " = n.typed(";
					ret.isDecl = false;
				} else if (type == 3 || type == 12) {
					if(depth == 2 && node.parent.indexInParent == ret.isModule) {
						//console.log("MOD:",value);
						if(node.indexInParent == 1) {
							ret.modulePrefix = value;
							ret.text += "const "+value+" = {};";
						} else {
							ret.text += "// "+value;
						}
					} else if(depth == 2 && node.parent.name == "xq-version") {
						ret.text += value;
					} else if(depth == 2 && ret.isModule && node.parent.name == "$>" && node.indexInParent == 1) {
						const { prefix, name } = normalizeName(value);
						if(node.parent.count() > 2) {
							console.log("node",node.indexInParent);
							_access.nextSibling(node).forEach(next => {
								const dataType = next.name;
								console.log("EXP",name,dataType,next.indexInParent);
								const isFunction = dataType == "function";
								if(isFunction) {
									_access.firstChild(next).forEach(first => {
										const arity = first.count();
										if(prefix === ret.modulePrefix) {
											if(!ret.module[name]) ret.module[name] = [];
											ret.module[name].push(arity);
										}
										ret.text += prefix + "." + name + "$" + arity + " = " + "n.typed(";
									});
								} else {
									ret.text += prefix + "." + name + " = " + "n.typed(";
								}
							});
						} else {
							ret.text += prefix + "." + name + " = (";
						}
					} else if(depth == 2 && node.parent.name == "$<") {
						//console.log("import",node.parent.count());
						if(node.indexInParent == 1) {
							ret.text += "const "+value+" = ";
							if(node.parent.count() < 3) {
								ret.text += "require(\""+value.replace(/\.xql$/,".js")+"\"";
							}
						} else if(node.indexInParent == 3) {
							ret.text += "require(\""+value.replace(/\.xql$/,".js")+"\"";
						}
					} else {
					// FIXME this won't work for direct var calls
					// need to detect let-ret-seq always...
						let vars = ret.vars[depth - 1] || ret.seqs[depth - 2] || ret.quotes[depth - 2];
						if(vars && node.indexInParent == 1 && vars["$"]) {
							let isVar = !!ret.vars[depth - 1];
							if(isVar) vars["$"] = false;
							if(type != 12 && node.parent.count() > 1) {
								//console.log("ASSIG",value);
								// find arg in closure
								//let has = _findInClosure(ret.quotes,ret.seqs,depth - 2, value);
								//if(has) vars["$last"] = _util.camelCase(value);
								vars[value] = true;
								//if(!has) {
								//	ret.text += "let ";
								//}
								ret.text += "$(\"" + _util.camelCase(value) + "\",";
							} else {
								//console.log(isVar,value,ret.quotes[depth - 2],ret.seqs[depth - 2]);
								if(ret.quotes[depth - 2]) {
									//ret.text += ",\n";
									ret.quotes[depth - 2]["$"] = false;
									ret.quotes[depth - 2]["."] = true;
								}
								if(ret.seqs[depth - 2] && ret.seqs[depth - 2]["$"]) {
									//ret.text += ",\n";
									ret.seqs[depth - 2]["$"] = false;
									ret.seqs[depth - 2]["."] = true;
								}
								const ifCases = ret.ifCases[depth - 2];
								if(ifCases == 1) ret.text += "n.boolean(";
								if(type == 12) {
									ret.text += "$(" +value;
								} else {
									const { prefix, name } = normalizeName(value);
									ret.text += prefix ? "(" + prefix + "." + name : "$(\"" + name + "\"";
								}
								//ret.text += ")";
							}
						} else {
							if(ret.quotes[depth - 1]) {
								//console.log("found quote",depth - 1);
								//ret.text += ",\n";
								if(ret.quotes[depth - 1]["$"]) {
									ret.quotes[depth - 1]["$"] = false;
									ret.quotes[depth - 1]["."] = true;
								}
							}
							if(ret.seqs[depth - 1] && ret.seqs[depth - 1]["$"]) {
								//console.log("found seq",depth - 1);
								//ret.text += ",\n";
								ret.seqs[depth - 1]["$"] = false;
								ret.seqs[depth - 1]["."] = true;
							} else if(ret.ifCases[depth - 2]) {
								//console.log("found ifCases",_printTail(ret,20));
								//ret.text += "return ";
							}
							if(type == 3) {
								ret.text += "\"" + value.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/&quot;/g,"\\\"").replace(/&apos;/,"'") + "\"";
							} else {
								ret.text += value;
							}
							//console.log(value,node.parent.type,node.parent.name);
							if(node.parent.count() > node.indexInParent) ret.text += ",";
						}
					}
				}*/
				if(!cur) throw new Error("Datum encountered, but no open analysis found");
				if(cur.type == VAR || cur.type == EXPORT) {
					cur.name = value;
				} else {
					const a = new Datum(type,node,index);
					if(curQuot) {
						curQuot.ref = a;
					} else {
						cur.ref = a;
					}
				}
			}
		}
		return ret;
	}, { text: "", isDecl: false, isModule: 0, module: {}, quotes:[], ifCases:[], seqs: [], vars:[] }).map(function (ret) {
		ret.text = ret.text.replace(/,$/, "");
		delete ret.isDecl;
		return ret;
	}).map(x => {
		//console.log(x.text);
		let text = def+x.text;
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
			return text;
		}
	});
}
