"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.parseString = parseString;
exports.parse = parse;
exports.doc = doc;
exports.docL3Streaming = docL3Streaming;
exports.docStreaming = docStreaming;
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

function docStreaming($file) {
	// TODO streaming parsing
	return (0, _l.fromL3Stream)(docL3Streaming($file), 2);
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
const Scheduler = require("rxjs/Scheduler/async");
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
exports.if = (t,f,$) => {
	// try direct eval of the boolean
	if($) f = f.bind(null,frame($));
	var out = _seq.forEach(_type.boolean(t),f);
	//out.subscribe();
	return out;
};


function frame($=[],$$=[]) {
	const stack = $.slice();
	stack.unshift($[0]);
	if($$) {
		for (const k in $$) {
			if(typeof k == "number") continue;
			stack[k] = $$[k];
		}
	}
	const f = function(...a) {
		const l = a.length;
		if (a == 0) return f;
		const key = a[0];
		if (l == 1) {
			//console.log(key,args);
			//const has = key in f.$called;
			//f.$called[key] = true;
			const v = f[key];
			return v;
		}
		//const has = key in f;
		const v = l == 2 ? a[1] : a[2];
		f[key] = _seq.isSeq(v) ? v.shareReplay() : v;
		//if(has && _seq.isSeq(v)) v.subscribe();
	};
	f.$called = {};
	f.__proto__ = stack;
	f.$types = {};
	return f;
}

exports.frame = frame;
const map = require("./map");
const array = require("./array");
exports.pair = (k,v) => map.map([[k,v]]);
//export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";
exports.serialize = function serialize($s) {
	// FIXME on complete, reassemble arrays/maps
	// TODO fix 2 problems:
	// 1: struct must complete after items (ex. array /w maps must complete after all child maps)
	// 2: map key must be injected when value resolves
	// "struct" is the parent of the entries (seqs)
	// if the entry is a structure, the parent should complete after the entry
	let active = 0;
	//const resolved = new WeakMap();
	let vals = [];
	const _serialize = (vals,$s,cb) => {
		const _next = (s) => {
			if(_util.isList(s)) {
				const len = s.size + 2;
				const arr = new Array(len);
				arr[0] = 5;
				arr[len - 1] = 17;
				if(s.size) {
					// 1. prepare array
					// 2. for each seq, create an entry
					// 3. pass the entry to the handler
					let i = 1;
					for(let x of s) {
						const entry = arr[i++] = [];
						_serialize(entry,x,cb);
					}
				}
				vals.push.apply(vals,arr);
			} else if(_util.isMap(s)) {
				const len = s.size * 3 + 2;
				const arr = new Array(len);
				arr[0] = 6;
				arr[len - 1] = 17;
				if(s.size) {
					let i = 1;
					for(let [k,v] of s.entries()) {
						arr[i++] = 2;
						arr[i++] = k+"";
						const entry = arr[i++] = [];
						_serialize(entry,v,cb);
					}
				}
				vals.push.apply(vals,arr);
			} else if(typeof s == "string") {
				vals.push.apply(vals,[3,s]);
			} else if(typeof s == "number" || typeof s == "boolean"){
				vals.push.apply(vals,[12,s+""]);
			} else {
				console.log(s);
				throw new Error("Unknown type");
			}
		};

		active++;
		if(_seq.isSeq($s)) {
			//index++;
			// if has any substructure, let that complete first, otherwise just complete
			let has = false;
			$s.subscribe({
				next:s => {
					has = true;
					_next(s);
				},
				complete: () => {
					// THIS means seq complete
					// we want to know ITEM complete
					if(!has) {
						vals.push.apply(vals,[12,null]);
					}
					active--;
					if(!active) {
						//console.log("outer done");
						cb();
					}
					// this is our completer for the entire seq
					// if the seq contains a sub-structure, we should not complete
					// but first let all subs complete
				},
				error: err => {
					cb(err);
				}
			});
		} else {
			_next($s);
			active--;
			if(!active) {
				//console.log("outer done");
				cb();
			}
		}
	};
	//$s = _seq.seq($s);
	return _seq.create($o => {
		const arrOrPub = vals => {
			for(const v of vals) {
				if(Array.isArray(v)) {
					arrOrPub(v);
				} else {
					$o.next(v);
				}
			}
		};
		_serialize(vals,$s,(err) => {
			if(err) return $o.error(err);
			arrOrPub(vals);
			$o.complete();
		});
	});
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
		return _map.fromEntries(Object.entries(x).map(([k,v]) => [k,_fromJS(v)]));
	} else {
		return x;
	}
}

function jsonDoc(file) {
	var json = require(file);
	var p = _fromJS(json);
	return _seq.seq(p);
}
