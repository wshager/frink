"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getType = undefined;
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.ituple = ituple;
exports.next = next;
exports.push = push;
exports.set = set;
exports.removeChild = removeChild;
exports.cached = cached;
exports.keys = keys;
exports.values = values;
exports.finalize = finalize;
exports.setAttribute = setAttribute;
exports.getAttribute = getAttribute;
exports.count = count;
exports.first = first;
exports.last = last;
exports.attrEntries = attrEntries;
exports.modify = modify;
exports.stringify = stringify;

var _vnode = require("./vnode");

var _pretty = require("./pretty");

var _transducers = require("./transducers");

var _multimap = require("./multimap");

var multimap = _interopRequireWildcard(_multimap);

var _inode = require("./inode");

var cx = _interopRequireWildcard(_inode);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// helpers ---------------


//import { q } from "./qname";

if (!Object.values) {
	var objUtil = function objUtil(obj, f) {
		var keys = Object.keys(obj);
		var entries = [];
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			entries.push(f(key));
		}
		return entries;
	};
	Object.values = function (o) {
		return objUtil(o, function (key) {
			return o[key];
		});
	};
	Object.entries = function (o) {
		return objUtil(o, function (key) {
			return [key, o[key]];
		});
	};
}

// import self!

function _inferType(inode) {
	if (inode === null) return 12;
	var cc = inode.constructor;
	if (cc == Array) {
		return 5;
	} else if (cc == Object) {
		if (inode.$children) {
			return inode.$name == "#document" ? 9 : inode.$name == "#document-fragment" ? 11 : 1;
		} else if (inode.$value) {
			return 2;
		} else if (inode.$pi) {
			return 7;
		} else if (inode.$comment) {
			return 8;
		} else {
			return 6;
		}
	} else if (cc == Number || cc == Boolean) {
		return 12;
	}
	return 3;
}

/*
function* _get(children, idx) {
	let len = children.length;
	for (let i = 0; i < len; i++) {
		if ((children[i].$name || i + 1) == idx) {
			yield children[i];
		}
	}
}
*/
function _last(a) {
	return (0, _transducers.drop)(a, a.length - 1);
}

function _elemToString(e) {
	var attrFunc = function attrFunc(z, kv) {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	var str = "<" + e.$name;
	var ns = e.$ns;
	if (ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = (0, _transducers.foldLeft)(Object.entries(e.$attrs), str, attrFunc);
	if (e.$children.length > 0) {
		str += ">";
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = e.$children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var c = _step.value;

				str += stringify(c);
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

		str += "</" + e.$name + ">";
	} else {
		str += "/>";
	}
	return str;
}

// -----------------------

function ivalue(type, value) {
	if (type == 7) {
		return { $pi: value };
	} else if (type == 8) {
		return { $comment: value };
	}
	return value;
}

function vnode(inode, parent, depth, indexInParent, type) {
	type = type || _inferType(inode);
	var name, value;
	if (type == 1 || type == 9 || type == 11) {
		name = inode.$name;
	} else if (type == 2) {
		// TODO tuple under map, attr under elem
		name = inode.$name;
		value = inode.$value;
		//} else if (type == 5) {
		// no-op
		//} else if (type == 6) {
		// no-op
	} else if (type == 7) {
		value = inode.$pi;
	} else if (type == 8) {
		value = inode.$comment;
	} else if (type == 3 || type == 12) {
		value = inode;
	}
	// return vnode
	return new _vnode.VNode(cx, inode, type,
	//inode && inode.$ns ? q(inode.$ns.uri, name) : name,
	name, value, parent, depth, indexInParent);
}

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? [] : {};
	if (type == 1 || type == 9 || type == 11) {
		inode.$name = name;
		inode.$attrs = attrs;
		inode.$ns = ns;
		inode.$children = [];
	}
	return inode;
}

function emptyAttrMap(init) {
	return init || {};
}

function ituple(key, child, keyType) {
	return {
		$name: key,
		$type: keyType,
		$value: child
	};
}

/*
export function get(inode,idx,type,cache){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		if(cache) return cache[idx];
		return _get(inode.$children,idx);
	}
	return inode[idx];
}
*/
function next(inode, node, type) {
	type = type || _inferType(inode);
	var idx = node.indexInParent;
	if (type == 1 || type == 9) {
		return inode.$children[idx + 1];
	}
	if (type == 5) return inode[idx + 1];
	if (type == 6) {
		var vals = Object.values(inode);
		return vals[idx + 1];
	}
}

function push(inode, val, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		inode.$children.push(val[1]);
	} else if (type == 5) {
		inode.push(val);
	} else if (type == 6) {
		inode[val[0]] = val[1];
	}
	return inode;
}

function set(inode /*,key,val,type*/) {
	// used to restore immutable parents, never modifies mutable
	return inode;
}

function removeChild(inode, child, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		inode.$children.splice(child.indexInParent, 1);
	} else if (type == 5) {
		inode.splice(child.indexInParent, 1);
	} else if (type == 6) {
		delete inode[child.name];
	}
	return inode;
}

function cached(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		var children = inode.$children,
		    len = children.length,
		    cache = multimap.default();
		for (var i = 0; i < len; i++) {
			cache.push([children[i].$name || i + 1, children[i]]);
		}
		return cache;
	}
	if (type == 5) {
		return {
			keys: function keys() {
				return (0, _transducers.range)(inode.length).toArray();
			}
		};
	}
	if (type == 6) {
		return {
			keys: function keys() {
				return Object.keys(inode);
			}
		};
	}
}

function keys(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		var children = inode.$children,
		    len = children.length,
		    _keys = [];
		for (var i = 0; i < len; i++) {
			_keys[i] = children[i].$name || i + 1;
		}
		return _keys;
	}
	if (type == 5) return (0, _transducers.range)(inode.length).toArray();
	if (type == 6) return Object.keys(inode);
	return [];
}

function values(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) return inode.$children;
	if (type == 2) return [[inode.$name, inode.$value]];
	if (type == 6) return Object.values(inode);
	if (type == 8) return [inode.$comment];
	return inode;
}

function finalize(inode) {
	return inode;
}

function setAttribute(inode, key, val) {
	if (inode.$attrs) inode.$attrs[key] = val;
	return inode;
}

function getAttribute(inode, key) {
	if (inode.$attrs) return inode.$attrs[key];
}

function count(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		return inode.$children.length;
	} else if (type == 5) {
		return inode.length;
	} else if (type == 6) {
		return Object.keys(inode).length;
	}
	return 0;
}

function first(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		return inode.$children[0];
	} else if (type == 5) {
		return inode[0];
	} else if (type == 6) {
		return Object.values(inode)[0];
	}
}

function last(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) return _last(inode.$children);
	if (type == 5) return _last(inode);
	if (type == 6) {
		return _last(Object.values(inode));
	}
}

function attrEntries(inode) {
	if (inode.$attrs) return Object.entries(inode.$attrs);
	return [];
}

function modify(inode, node, ref, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		if (ref !== undefined) {
			inode.$children.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.$children.push(node.inode);
		}
	} else if (type == 5) {
		if (ref !== undefined) {
			inode.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.push(node.inode);
		}
	} else if (type == 6) {
		inode[node.name] = node.inode;
	}
	return inode;
}

function stringify(inode, type) {
	var root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

	var str = "";
	type = type || _inferType(inode);
	if (type == 1) {
		str += _elemToString(inode);
	} else if (type == 5) {
		var val = (0, _transducers.forEach)(inode, function (c) {
			return stringify(c);
		}).join("");
		str += "<l3:l" + (val ? ">" + val + "</l3:l>" : "/>");
	} else if (type == 6) {
		var _val = (0, _transducers.forEach)(Object.entries(inode), function (c) {
			return stringify(c[1], null, false, c[0]);
		}).join("");
		str += "<l3:m" + (_val ? ">" + _val + "</l3:m>" : "/>");
	} else {
		if (type == 8) {
			str += "<!--" + inode.$comment + "-->";
		} else {
			var _val2 = inode === null ? "null" : inode;
			str += type == 12 ? "<l3:x>" + _val2 + "</l3:x>" : _val2;
		}
	}
	return root ? (0, _pretty.prettyXML)(str) : str;
}

var getType = exports.getType = _inferType;