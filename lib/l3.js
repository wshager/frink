"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.str2array = str2array;
exports.array2str = array2str;
exports.convert = convert;
exports.toL3 = toL3;
exports.fromL3 = fromL3;

var _inode = require("./inode");

var inode = _interopRequireWildcard(_inode);

var _access = require("./access");

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
function toL3(doc) {
	var to2D = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	var schema = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	var cx = this && this.vnode ? this : inode;
	doc = _access.getDoc.bind(cx)(doc);
	var out = [],
	    names = {},
	    i = 0,
	    j = 15;
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = doc.attrEntries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var attr = _step.value;

			var name = attr[0],
			    attrname = "@" + name;
			if (!names[attrname]) {
				names[attrname] = ++j;
				out[i++] = 15;
				i = str2array(name, out, i);
			}
			out[i++] = docAttrType(attr[0]);
			i = str2array(attr[0], out, i);
			i = str2array(attr[1], out, i);
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

	var schemaIter = schema ? (0, _access.docIter)(schema) : new Nil();
	var schemaEntry = schemaIter.next();
	_access.iter.bind(cx)(_access.firstChild.bind(cx)(doc), function (node) {
		var type = node.type,
		    depth = node.depth + 15,
		    name = node.name;
		if (type == 17) return;
		// if there's a schema entry and all schema props are equal then the node has a schema entry
		// else if there's a schema entry, the value is not there (which was assumed valid)
		// else write the node name + type
		// if indexInParent is not equal, we skipped a schema entry
		// TODO allow partial schema somewhere in the document tree
		var nodeHasSchema = !schemaEntry.done && schemaEntry.depth == depth && schemaEntry.name == name;
		// if this node has a schema, continue with next, else skip and try with next entry
		if (nodeHasSchema) schemaEntry = schemaIter.next();
		var nameIndex = 0;
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
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = node.attrEntries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _attr = _step2.value;

					var _name = _attr[0],
					    attrname = "@" + _name;
					if (!names[attrname]) {
						names[attrname] = ++j;
						out[i++] = 15;
						i = str2array(_name, out, i);
					}
					out[i++] = 2;
					out[i++] = names[attrname];
					i = str2array(_attr[1], out, i);
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
		} else if (type == 3) {
			i = str2array(node.value, out, i);
		} else if (type == 12) {
			i = str2array(node.value + "", out, i);
		}
	});
	return out;
}

function fromL3(l3) {
	var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

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
	var schemaIter = schema ? (0, _access.docIter)(schema) : new Nil();
	var schemaEntry = schemaIter.next();
	var process = function process(entry) {
		var type = entry[0];
		var hasSchema = false,
		    skipSchema = false,
		    schemaName = void 0;
		// TODO have attributes accept any type
		if (!type) {
			// assume schema
			hasSchema = true;
			type = schemaEntry.type;
			schemaName = schemaEntry.name;
		}
		if (type == 2) {
			var parent = parents[depth];
			var name = names[entry[1]];
			parent = cx.setAttribute(parent, name, array2str(entry, 2));
		} else if (type == 7 || type == 11) {
			doc = cx.setAttribute(doc, entry[1] == 11 ? 10 : 7, array2str(entry, 2));
		} else if (type == 15) {
			n++;
			names[n] = array2str(entry, 1);
		} else {
			depth = entry[1];
			var _parent = parents[depth - 1];
			var parentType = parentTypes[depth - 1];
			var node = void 0,
			    _name2 = void 0,
			    valIndex = void 0;
			if (type == 1 || type == 5 || type == 6) {
				_name2 = names[entry[2]];
				if (_name2) {
					if (hasSchema && schemaName != _name2) skipSchema = true;
				} else {
					_name2 = schemaName;
				}
				if (parents[depth]) {
					parents[depth] = cx.finalize(parents[depth]);
				}
				node = cx.emptyINode(type, _name2, cx.emptyAttrMap());
				parents[depth] = node;
				parentTypes[depth] = type;
			} else if (type == 3 || type == 12) {
				if (parentType == 1 || parentType == 9) {
					_name2 = cx.count(_parent);
					valIndex = 2;
				} else {
					_name2 = names[entry[2]];
					if (_name2) {
						if (hasSchema && schemaName != _name2) skipSchema = true;
					} else {
						_name2 = schemaName;
					}
					valIndex = 3;
				}
				var val = type == 3 ? array2str(entry, valIndex) : convert(array2str(entry, valIndex));
				node = cx.ivalue(type, _name2, val);
			}
			if (_parent) _parent = cx.push(_parent, [_name2, node]);
		}
	};
	var entry = [];
	for (var i = 0, l = l3.length; i < l; i++) {
		var x = l3[i];
		if (x < 16 && x != 9 && x != 10 && x != 13) {
			if (i > 0) process(entry);
			entry = [];
		}
		entry.push(x);
	}
	process(entry);
	return cx.finalize(parents[15]);
}