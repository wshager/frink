"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.fromJS = fromJS;
exports.toJS = toJS;
exports.iter = iter;
exports.fromL3 = fromL3;
exports.toL3 = toL3;

var _inode = require("./inode");

var inode = _interopRequireWildcard(_inode);

var _doc = require("./doc");

var _l = require("./l3");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function process(entry, parent, key, cx) {
	var cc = entry.constructor;
	if (cc === Object) {
		if (entry.$children) {
			var name = entry.$name;
			var node = cx.emptyINode(1, name, cx.emptyAttrMap(entry.$attrs));
			parent = cx.push(parent, [name, node]);
			for (var i = 0, l = entry.$children.length; i < l; i++) {
				process(entry.$children[i], node, i, cx);
			}
			node = cx.finalize(node);
		} else {
			var _name = key !== undefined ? key : "#object";
			var _node = cx.emptyINode(6, _name);
			parent = cx.push(parent, [_name, _node]);
			var keys = Object.keys(entry);
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var k = _step.value;

					process(entry[k], _node, k, cx);
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

			_node = cx.finalize(_node);
		}
	} else if (cc === Array) {
		var _name2 = key !== undefined ? key : "#array";
		var _node2 = cx.emptyINode(5, _name2);
		parent = cx.push(parent, [_name2, _node2]);
		for (var _i = 0, len = entry.length; _i < len; _i++) {
			process(entry[_i], _node2, _i, cx);
		}
		_node2 = cx.finalize(_node2);
	} else {
		var _node3 = cx.ivalue(entry.constructor === String ? 3 : 12, key, entry);
		parent = cx.push(parent, [key, _node3]);
	}
}

function fromJS(json) {
	var cx = this.vnode ? this : inode;
	var doc = cx.emptyINode(9, "#document", cx.emptyAttrMap());
	process(json, doc, undefined, cx);
	return cx.finalize(doc);
}

function toJS(doc) {
	function process(node, out, key) {
		var type = node.type,
		    name = node.name;
		if (type == 1) {
			var attrs = {},
			    arr = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = node.attrEntries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var attr = _step2.value;

					attrs[attr[0]] = attr[1];
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			var i = 0;
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = node[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var n = _step3.value;

					process(n, arr, i++);
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			var e = { $name: name, $attrs: attrs, $children: arr };
			if (out === undefined) {
				out = e;
			} else {
				out[key] = e;
			}
		} else if (type == 3 || type == 12) {
			if (out === undefined) {
				out = node.value;
			} else {
				out[key] = node.value;
			}
		} else if (type == 5) {
			var _arr = [];
			var _i2 = 0;
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = node[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var _n = _step4.value;

					process(_n, _arr, _i2++);
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			if (out === undefined) {
				out = _arr;
			} else {
				out[key] = _arr;
			}
		} else if (type == 6) {
			var obj = {};
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = node[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var _n2 = _step5.value;

					process(_n2, obj, _n2.name);
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			if (out === undefined) {
				out = obj;
			} else {
				out[key] = obj;
			}
		}
		return out;
	}
	// discard DOC for now
	return process(_doc.ensureDoc.bind((this, inode))(doc));
}

function _inferType(val) {
	var cc = val.constructor;
	return cc == Array ? 5 : cc == Object ? 6 : cc == String ? 3 : 12;
}

function iter(json, fn) {
	var parents = [],
	    pindexes = [],
	    indexInParent = 0;
	function next(node, skipFirst) {
		var type = node[0],
		    depth = node[1],
		    entry = node[3];
		if (type == 6) {
			var ks = Object.keys(entry);
			var klen = ks.length;
			// try first entry
			if (klen > 0 && !skipFirst) {
				//console.log("found first",ks[0], depth);
				pindexes[depth] = indexInParent;
				parents[depth] = entry;
				indexInParent = 0;
				depth++;
				pindexes[depth] = 0;
				var key = ks[0];
				var val = entry[key];
				return [_inferType(val), depth, key, val];
			} else {
				pindexes[depth] = ++indexInParent;
				if (indexInParent < klen) {
					//console.log("found next",indexInParent,ks[indexInParent]);
					// continue with next
					var _key = ks[indexInParent];
					var _val = entry[_key];
					return [_inferType(_val), depth, _key, _val];
				} else {
					// go up
					depth--;
					if (depth == 1) return;
					indexInParent = pindexes[depth];
					var parent = parents[depth - 1];
					return next([_inferType(parent), depth, 0, parent], true);
				}
			}
		} else if (type == 5) {
			var len = entry.length;
			// try first entry
			if (len > 0 && !skipFirst) {
				//console.log("found first",entry[0], depth);
				pindexes[depth] = indexInParent;
				parents[depth] = entry;
				indexInParent = 0;
				depth++;
				pindexes[depth] = 0;
				var _key2 = 0;
				var _val2 = entry[_key2];
				return [_inferType(_val2), depth, _key2, _val2];
			} else {
				pindexes[depth] = ++indexInParent;
				if (indexInParent < len) {
					//console.log("found next",indexInParent);
					// continue with next
					var _key3 = indexInParent;
					var _val3 = entry[_key3];
					return [_inferType(_val3), depth, _key3, _val3];
				} else {
					// go up
					depth--;
					if (depth == 1) return;
					indexInParent = pindexes[depth];
					//console.log("go up a",depth,indexInParent);
					var _parent = parents[depth - 1];
					return next([_inferType(_parent), depth, 0, _parent], true);
				}
			}
		} else {
			indexInParent = pindexes[depth];
			var _parent2 = parents[depth - 1];
			return next([_inferType(_parent2), depth, 0, _parent2], true);
		}
	}
	// this is not the doc, so depth starts at 1
	var node = [_inferType(json), 1, "#", json];
	fn(node);
	do {
		node = next(node);
		if (node) fn(node);
	} while (node);
}

var _isObject = function _isObject(parent) {
	return !!(parent && parent.constructor === Object);
};

function fromL3(l3) {
	var names = {},
	    parents = [],
	    n = 0;
	var process = function process(entry) {
		var type = entry[0],
		    depth = entry[1];
		if (type == 15) {
			n++;
			names[n] = (0, _l.array2str)(entry, 1);
		} else {
			var parent = parents[depth - 1];
			var isObj = _isObject(parent);
			var index = isObj ? 3 : 2;
			var key = isObj ? names[entry[2]] : null;
			//console.log("key",key, depth, parents[depth]);
			var val;
			if (type == 3) {
				val = (0, _l.array2str)(entry, index);
			} else if (type == 12) {
				val = (0, _l.convert)((0, _l.array2str)(entry, index));
			} else if (type == 5) {
				val = [];
				parents[depth] = val;
			} else if (type == 6) {
				val = {};
				parents[depth] = val;
			}
			if (parent !== undefined) {
				if (isObj) {
					parent[key] = val;
				} else {
					push(parent, val);
				}
			}
		}
	};
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
	return parents[1];
}

function toL3(doc) {
	var out = [],
	    names = {},
	    i = 1;
	var process = function process(node) {
		var type = node[0],
		    depth = node[1],
		    name = node[2],
		    val = node[3];
		// detect if parent is object/map, otherwise use integer
		var nameIndex;
		if (typeof name === "string") {
			if (!names[name]) {
				names[name] = i;
				i++;
				out.push(0);
				out.push(15);
				(0, _l.str2array)(name, out);
			}
			nameIndex = names[name];
		}
		out.push(0);
		out.push(type);
		out.push(depth);
		if (nameIndex) out.push(nameIndex);
		if (type == 3) {
			(0, _l.str2array)(val, out);
		} else if (type == 12) {
			(0, _l.str2array)(val + "", out);
		}
	};
	iter(doc, process);
	out.shift();
	return out;
}