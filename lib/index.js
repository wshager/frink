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

module.exports.childrenStreaming = require("./access-streaming").children.bind(_inode);

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
//const Scheduler = require("rxjs/Scheduler/async");
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

const numRe = /[0-9]+/;
function frame($=[],$$=[]) {
	const stack = $.slice(0);
	stack.unshift($[0]);
	if($$) {
		for (const k in $$) {
			if(numRe.test(k)) continue;
			stack[k] = $$[k];
		}
	}
	const f = function(...a) {
		const l = a.length;
		if (a == 0) return f;
		const key = a[0];
		if (l == 1) {
			//const has = key in f;
			const v = f[key];
			return v;
		}
		const v = l == 2 ? a[1] : a[2];
		f[key] = _seq.isSeq(v) ? v.operator && v.operator.name == "shareReplayOperation" ? v : v.shareReplay() : v instanceof Promise ? _seq.fromPromise(v) : v;
	};
	f.$replayed = {};
	f.__proto__ = stack;
	f.$types = {};
	return f;
}

exports.frame = frame;
const map = require("./map");
//const array = require("./array");
exports.pair = map.entry;
//export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";
exports.serialize = function serialize($s) {
	// FIXME on complete, reassemble arrays/maps
	// TODO fix 2 problems:
	// 1: struct must complete after items (ex. array /w maps must complete after all child maps)
	// 2: map key must be injected when value resolves
	// "struct" is the parent of the entries (seqs)
	// if the entry is a structure, the parent should complete after the entry
	const _serialize = (s) => {
		return s && s.toJS ? s.toJS() : typeof s == "function" ? "[Function]" : s.valueOf();
	};
	const _serializeSeq = $s => _seq.isSeq($s) ? _seq.forEach(_seq.empty($s), t => {
		return t ? null : _seq.forEach($s,s => _serializeSeq(s));
	}) : _serialize($s);
	return _serializeSeq($s);
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
	return p;
}
