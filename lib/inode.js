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
exports.previous = previous;
exports.push = push;
exports.get = get;
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
exports.toJS = toJS;
exports.callCount = callCount;

var _vnode = require("./vnode");

var _pretty = require("./pretty");

var _util = require("./util");

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
		if ("$children" in inode) {
			return inode.$name == "#document" ? 9 : inode.$name == "#document-fragment" ? 11 : 1;
		} else if (inode.$args) {
			return inode.$name !== undefined ? 14 : 15;
		} else if ("$value" in inode) {
			return 2;
		} else if ("$pi" in inode) {
			return 7;
		} else if ("$comment" in inode) {
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
	return a[a.length - 1];
}

function _elemToString(e) {
	var attrFunc = function attrFunc(z, kv) {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	var str = "<" + e.$name;
	var ns = e.$ns;
	if (ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = Object.entries(e.$attrs).reduce(attrFunc, str);
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
	var name,
	    key = inode.$key,
	    value;
	if (type == 1 || type == 9 || type == 11 || type == 14) {
		name = inode.$name;
	} else if (type == 2) {
		name = inode.$name;
		value = inode.$value;
		// this will ensure tuples are iterated as values (name != key)
		if (inode.$key) {
			inode = inode.$value;
			type = _inferType(inode);
		}
	} else if (type == 7) {
		value = inode.$pi;
	} else if (type == 8) {
		value = inode.$comment;
	} else if (type == 3 || type == 12) {
		value = inode;
	} else if (type == 15) {
		name = "quote";
	}
	// return vnode
	return new _vnode.VNode(cx, inode, type,
	//inode && inode.$ns ? q(inode.$ns.uri, name) : name,
		name, key, value, parent, depth, indexInParent);
}

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? [] : {};
	if (type == 1 || type == 9 || type == 11) {
		inode.$name = name;
		inode.$attrs = attrs;
		inode.$ns = ns;
		inode.$children = [];
	} else if (type == 14) {
		inode.$name = name;
		inode.$args = [];
	} else if (type == 15) {
		inode.$args = [];
	}
	return inode;
}

function emptyAttrMap(init) {
	return init || {};
}

function ituple(key, child) {
	return {
		$name: key,
		$value: child
	};
}

function get(inode,idx,type){
	type = type || _inferType(inode);
	if(type == 14 || type == 15){
		return inode.$args[idx - 1];
	}
	return inode.$children[idx - 1];
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

var _nextOrPrev = function _nextOrPrev(inode, node, type, dir) {
	type = type || _inferType(inode);
	var idx = node.indexInParent - 1;
	if (type == 1 || type == 9 || type == 11) {
		return inode.$children[idx + dir];
	}
	if (type == 14 || type == 15) {
		return inode.$args[idx + dir];
	}
	if (type == 5) return inode[idx + dir];
	if (type == 6) {
		var entries = Object.entries(inode);
		var kv = entries[idx + dir];
		// pass tuple-wise
		return { $key: kv[0], $value: kv[1] };
	}
};

function next(inode, node, type) {
	return _nextOrPrev(inode, node, type, 1);
}

function previous(inode, node, type) {
	return _nextOrPrev(inode, node, type, -1);
}

function push(inode, kv, type, has_call) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		inode.$children.push(kv[1]);
	} else if (type == 14 || type == 15) {
		if(has_call) {
			inode.$call_args.push(kv[1]);
		} else {
			inode.$args.push(kv[1]);
		}
	} else if (type == 5) {
		inode.push(kv[1]);
	} else if (type == 6) {
		inode[kv[0]] = kv[1];
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
		delete inode[child.key];
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
				return (0, _util.range)(inode.length);
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
	if (type == 5) return (0, _util.range)(inode.length);
	if (type == 6) return Object.keys(inode);
	return [];
}

function values(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) return inode.$children;
	if (type == 14 || type == 15) return inode.$args;
	if (type == 2) return [[inode.$name, inode.$value]];
	if (type == 6)
		// tuple-wise
		return Object.entries(inode).map(function (kv) {
			return { $key: kv[0], $value: kv[1] };
		});
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
	} else if (type == 14 || type == 15) {
		return inode.$args.length;
	} else if (type == 5) {
		return inode.length;
	} else if (type == 6) {
		return Object.keys(inode).length;
	}
	return 0;
}


function callCount(inode, type) {
	type = type || _inferType(inode);
	if (type == 14 || type == 15) {
		return inode.$call_args.length;
	}
	return 0;
}

function first(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		return inode.$children[0];
	} else if (type == 14 || type == 15) {
		return inode.$args[0];
	} else if (type == 5) {
		return inode[0];
	} else if (type == 6) {
		var entries = Object.entries(inode);
		var kv = entries[0];
		// pass tuple-wise
		return { $key: kv[0], $value: kv[1] };
	}
}

function last(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) return _last(inode.$children);
	if (type == 14 || type == 15) return _last(inode.$args);
	if (type == 5) return _last(inode);
	if (type == 6) {
		var entries = Object.entries(inode);
		var kv = _last(entries);
		// pass tuple-wise
		return { $key: kv[0], $value: kv[1] };
	}
}

function attrEntries(inode) {
	if (inode.$attrs) return Object.entries(inode.$attrs);
	return [];
}

function modify(inode, node, ref, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9 || type == 11) {
		if (node.type == 2) {
			// TODO conversion rules!
			inode.$attrs[node.name] = node.inode.$value + "";
		} else if (ref !== undefined) {
			inode.$children.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.$children.push(node.inode);
		}
	} else if (type == 14 || type == 15) {
		if (ref !== undefined) {
			inode.$args.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.$args.push(node.inode);
		}
	} else if (type == 2) {
		inode.$value = node.inode;
	} else if (type == 5) {
		if (ref !== undefined) {
			inode.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.push(node.inode);
		}
	} else if (type == 6) {
		inode[node.name] = node.inode.$value;
	}
	return inode;
}

function toJS(inode,type) {
	type = type || _inferType(inode);
	if(type == 5) {
		return inode.map(x => toJS(x));
	} else if(type == 6) {
		return Object.entries(inode).reduce((acc,[k,v]) => {
			acc[k] = toJS(v);
			return acc;
		},{});
	} else {
		return inode.valueOf();
	}
}

function stringify(inode, type) {
	var json = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	var root = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

	var str = "";
	type = type || _inferType(inode);
	if (type == 1) {
		str += _elemToString(inode);
	} else if (type == 2) {
		str += "<l3:a name=\"" + inode.$key + "\">" + inode.$value + "</l3:a>";
	} else if (type == 5) {
		var _val = inode.map(function (c) {
			return stringify(c, 0, true, false);
		}).join("");
		str += "<l3:l" + (_val ? ">" + _val + "</l3:l>" : "/>");
	} else if (type == 6) {
		var _val3 = Object.entries(inode).map(function (c) {
			return stringify({ $key: c[0], $value: stringify(c[1], 0, true, false) }, 2, json, false);
		}).join("");
		str += "<l3:m" + (_val3 ? ">" + _val3 + "</l3:m>" : "/>");
	} else if (type == 14 || type == 15) {
		var _val4 = inode.$args.map(function (c) {
			return stringify(c, 0, true, false);
		}).join("");
		if(type == 14) {
			str += "<l3:f name=\"" + inode.$name + "\"" + (_val4 ? ">" + _val4 + "</l3:f>" : "/>");
		} else {
			str += "<l3:q" + (_val4 ? ">" + _val4 + "</l3:q>" : "/>");
		}
	} else {
		if (type == 7) {
			str += "<?" + inode.$pi + "?>";
		} else if (type == 8) {
			str += "<!--" + inode.$comment + "-->";
		} else {
			var _val2 = inode === null ? "null" : inode;
			str += type == 12 || json ? "<l3:x>" + _val2 + "</l3:x>" : _val2;
		}
	}
	return root ? (0, _pretty.prettyXML)(str) : str;
}

var getType = exports.getType = _inferType;
