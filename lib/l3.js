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

Nil.prototype.next = function () {
	return { done: true };
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
							var _node = new _vnode.VNode(cx, _inode, _inode.$type, name, key, isLeaf(type) ? _inode.valueOf() : null, parent, _depth, parent.count());
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
						_inode = { $name: name, $args: [] };
						break;
					case 15:
						_inode = { $name: name, $args: [] };
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
					if (type == 12) value = JSON.parse(value);
					_inode = new value.constructor(value);
					if (openTuples[ndepth] !== undefined) {
						key = openTuples[ndepth];
						//console.log("picked up tuple",ndepth,key);
						openTuples[ndepth] = undefined;
						if (last == 6) {
							if (parent) parent.push([key, _inode]);
						} else if (last == 1) {
							parent.attr(key, value);
							stack = [];
							return;
						} else {
							// error
						}
					} else {
						if (parent) parent.push([null, _inode]);
					}
				}
			}
			stack = [];
			var depth = parent ? parent.depth + 1 : type == 9 || type == 11 ? 0 : 1;
			var node = new _vnode.VNode(cx, _inode, type, name, key, isLeaf(type) ? _inode.valueOf() : null, parent, depth, parent.count());
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

var normalizeName = function normalizeName(str) {
	var hasPrefix = /:/.test(str);
	var prefix = hasPrefix ? str.replace(/^([^:]*):.*$/, "$1") : "n";
	var name = !str ? "seq" : (0, _util.camelCase)(hasPrefix ? str.replace(/^[^:]*:(.*)$/, "$1") : str);
	return { prefix: prefix, name: name };
};

function toJS(o) {
	return o.reduce(function (ret, node) {
		// this will be the new version of streaming-fromL3!
		var type = node.type;
		var fn = "n." + constructormap[type];
		if (type != 17) {
			if (type == 18) {
				ret.text = ret.text.replace(/,$/, "") + ")(";
			} else if (isBranch(type)) {
				switch (type) {
					case 1:
					case 14:
						{
							var depth = node.depth;
							if (type == 14) {
								if (/^\$$/.test(node.name)) {
									var parentCount = node.parent ? node.parent.count() : 0;
									//if(depth == 1) console.log(node.indexInParent,node.parent.count());
									var isDecl = depth == 1 && (ret.isModule || node.indexInParent < parentCount);
									ret.isDecl = isDecl;
									ret.text += isDecl ? "" : "$(";
								} else if (/^\$\*$/.test(node.name)) {
									ret.text += "n.module($,";
								} else if (/^\$<$/.test(node.name)) {
									ret.text += "n.import($,";
								} else if (/^\$>$/.test(node.name)) {
									ret.text += "n.export($,";
									//} else if(/^\$\.$/.test(node.name)) {
									//	ret.text += "n.private($,";
								} else {
									var _normalizeName = normalizeName(node.name),
									    prefix = _normalizeName.prefix,
									    name = _normalizeName.name;

									ret.text += prefix + "." + name + "(";
								}
							}
						}
						break;
					case 15:
						{
							//let qname = isTuple ? stack[2] : stack[1];
							//qname = /[$:]/g.test(qname) ? qname.replace(/:/, ".") : qname;
							ret.text += "(...a) => ($ = n.frame(a,$),";
						}
						break;
					case 5:
					case 6:
						{
							ret.text += fn + "(";
						}
						break;
				}
			} else {
				var value = node.value;
				if (type == 8) {
					ret.text = ret.text.replace(/,$/, "");
					value = "/*" + value + "*/";
				} else if (ret.isDecl) {
					var _normalizeName2 = normalizeName(value),
					    _prefix = _normalizeName2.prefix,
					    _name = _normalizeName2.name;

					ret.modules[_prefix] |= 0;
					ret.modules[_prefix]++;
					value = _prefix + "." + _name + " = n.quoteTyped(";
					ret.isDecl = false;
				} else if (type == 3) {
					value = "\"" + value + "\",";
				} else {
					value += ",";
				}
				ret.text += value;
			}
		} else {
			ret.text = ret.text.replace(/,$/, "");
			// call quote with params, etc using closure!
			ret.text += ret.isModule && node.node.depth == 1 ? ");\n" : "),";
		}
		return ret;
	}, { text: "", isDecl: false, isModule: false, modules: {} }).map(function (ret) {
		ret.text = ret.text.replace(/,$/, "");
		delete ret.isDecl;
		return ret;
	});
}