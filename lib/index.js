"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.parseString = parseString;
exports.parse = parse;
exports.doc = doc;
exports.docL3Streaming = docL3Streaming;
exports.vdocStreaming = vdocStreaming;
exports.collection = collection;

var _doc = require("./doc");

Object.keys(_doc).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _doc[key];
		}
	});
});

var _construct = require("./construct");

Object.keys(_construct).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _construct[key];
		}
	});
});

var _qname = require("./qname");

Object.keys(_qname).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _qname[key];
		}
	});
});

var _modify = require("./modify");

Object.keys(_modify).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _modify[key];
		}
	});
});

var _access = require("./access");

Object.keys(_access).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _access[key];
		}
	});
});

var _l = require("./l3");

Object.keys(_l).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _l[key];
		}
	});
});

var _seq = require("./seq");

Object.keys(_seq).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _seq[key];
		}
	});
});

var _subseq = require("./subseq");

Object.keys(_subseq).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _subseq[key];
		}
	});
});

var _type = require("./type");

Object.keys(_type).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _type[key];
		}
	});
});

var _string = require("./string");

Object.keys(_string).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _string[key];
		}
	});
});

var _function = require("./function");

Object.keys(_function).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _function[key];
		}
	});
});

var _op = require("./op");

Object.keys(_op).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _op[key];
		}
	});
});

var _validate = require("./validate");

Object.keys(_validate).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _validate[key];
		}
	});
});

var _inode = require("./inode");

module.exports.selectStreaming = require("./access-streaming").selectStreaming.bind(_inode);

module.exports.childrenStreamin = require("./access-streaming").children.bind(_inode);

var inode = _interopRequireWildcard(_inode);

var _parser = require("./parser");

var _parserL3Stream = require("./parser-l3-stream");

var _fs = require("./fs");

var _util = require("./util");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

if (_util.isNodeEnv && !global.URL) {
	var url = require("url");
	global.URL = url.URL;
}

function parseString(str, cb) {
	var parser = new _parser.Parser(inode);
	return parser.parseString(str, cb);
}

function parse($s) {
	return _seq.forEach((0, _seq.zeroOrOne)($s),function (s) {
		return (0, _seq.create)(function (o) {
			parseString(s, function (err, ret) {
				if (err) return o.error(err);
				o.next(ret);
				o.complete();
			});
		}).shareReplay();
	});
}

function doc($file) {
	return _seq.forEach((0, _seq.zeroOrOne)($file),function (file) {
		return (0, _seq.create)(function (o) {
			(0, _fs.readFile)(file.toString(), function (err, res) {
				if (err) return o.error(err);
				parse(res.toString()).subscribe({
					next: function next(x) {
						return o.next(x);
					},
					error: function error(err) {
						return o.error(err);
					},
					complete: function complete() {
						return o.complete();
					}
				});
			});
		});
	});
}

function docL3Streaming($file) {
	return _seq.forEach((0, _seq.zeroOrOne)($file),function (file) {
		return (0, _parserL3Stream.parse)(file.toString());
	});
}

function vdocStreaming($file) {
	// TODO streaming parsing
	return (0, _l.fromL3Stream)(docL3Streaming($file), 2).share();
}

function collection($uri) {
	return (0, _seq.zeroOrOne)($uri).concatMap(function (uri) {
		return (0, _seq.create)(function (o) {
			(0, _fs.readdir)(uri, function (err, res) {
				if (err) return o.error(err);
				res.forEach(function (file) {
					doc(uri + "/" + file).subscribe({
						next: function next(x) {
							return o.next(x);
						},
						error: function error(err) {
							return o.error(err);
						}
					});
				});
				o.complete();
			});
		});
	}).share();
}

exports.item = a => a;
exports.function = a => a;
exports.occurs = a => a;
exports.array = () => _array.List;
exports.map = () => _map.Map;
exports.anyAtomicType = a => a;
exports.typed = (t,a) => a;
exports.zeroOrMore = a => a;
exports.xForEach = _seq.forEach;
exports.false = () => false;
exports.true = () => true;
exports.if = (t,f,...v) => {
	// try direct eval of the boolean
	if(v.length) f = f.bind.apply(f,[null,...v]);
	var out = _seq.forEach(_type.boolean(t),f);
	//out.subscribe();
	return out;
};

class Frame {}

exports.frame = (args, closure) => {
	if(closure === undefined && args instanceof Frame) {
		closure = args;
		args = [];
	}
	const stack = args.slice(0);
	stack.unshift(args[0]);
	if (closure) {
		for (const k in closure._stack) {
			if (typeof k != "string") continue;
			stack[k] = closure._stack[k];
		}
	}
	const f = function(...a) {
		const l = a.length;
		if (a == 0) return f;
		const key = a[0];
		if (l == 1) {
			//console.log(key,args);
			return stack[key];
		} else {
			if (l == 2) {
				if (/\./.test(key)) {
					const parts = key.split(".");
					stack.$modules[parts[0]][parts[1]] = a[1];
				} else {
					stack[key] = a[1];
				}
			} else {
				//types[key] = a[1];
				if (/\./.test(key)) {
					const parts = key.split(".");
					stack.$modules[parts[0]][parts[1]] = a[1];
				} else {
					stack[key] = a[2];
				}
			}
			//return f;
		}
	};
	f._stack = stack;
	f.__proto__ = new Frame();
	//f._types = types;
	return f;
};
const map = require("./map");
const array = require("./array");
exports.pair = (k,v) => map.map({[k]:v});
//export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";
exports.serialize = function serialize($s) {
	// FIXME on complete, reassemble arrays/maps
	let active = 0;
	const resolved = new WeakMap();
	const _serialize = ($o,$s,parent,k) => {
		const _next = (s) => {
			if(_seq.isSeq(s)) {
				active++;
				s.subscribe({
					next:x => {
						_serialize($o,x,parent,k);
					},
					complete:() => {
						//if(close) $o.next([17]);
						active--;
						if(!active) {
							console.log("inner done",k,active);
						}
					},
					error:err => {
						$o.error(err);
					}
				});
			} else {
				if(k) $o.next([2,k+""]);
				if(_util.isList(s)) {
					$o.next([5]);
					resolved.set(s,0);
					for(let x of s) {
						_serialize($o,_seq.seq(x),s);
					}
				} else if(_util.isMap(s)) {
					$o.next([6]);
					resolved.set(s,0);
					for(let [k,v] of s.entries()) {
						_serialize($o,_seq.seq(v),s,k);
					}
				} else if(typeof s == "string") {
					$o.next([3,s]);
				} else if(typeof s == "number" || typeof s == "boolean"){
					$o.next([12,s+""]);
				} else {
					console.log(s);
					throw new Error("Unknown type");
				}
			}
		};
		if(_seq.isSeq($s)) {
			active++;
			$s.subscribe({
				next:s => {
					_next(s);
				},
				complete: () => {
					active--;
					if(parent && resolved.has(parent)) {
						const size = resolved.get(parent)+1;
						resolved.set(parent,size);
						if(size == parent.size) {
							$o.next([17]);
							resolved.delete(parent);
						}
					}
					if(!active) {
						//console.log("outer done",k,active);
						$o.complete();
					}
				},
				error: err => {
					$o.error(err);
				}
			});
		} else {
			_next($s);
		}
	};
	$s = _seq.seq($s);
	return _seq.create($o => {
		_serialize($o,$s);
	}).concatAll();
};

module.exports.xFilter = xFilter;
module.exports.jsonDoc = jsonDoc;
module.exports.fromL3 = _l.fromL3Stream;


function xFilter($s,$fn) {
	return _seq.filter($s,$fn);
}
const _array = require("./array");
const _map = require("./map");
function _fromJS(x) {
	if(Array.isArray(x)) {
		return _array.array.apply(null,x.map(x => _fromJS(x)));
	} else if(_util.isObject(x)) {
		return _map.mapSeq(_map.fromEntries(Object.entries(x).map(([k,v]) => [k,_fromJS(v)])));
	} else {
		return x;
	}
}

function jsonDoc(file) {
	var json = require(file);
	var p = _fromJS(json);
	return _seq.seq(p);
}
