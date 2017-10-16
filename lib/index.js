"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.map = exports.array = exports.jsFromL3 = exports.jsToL3 = exports.iterJS = exports.toJS = exports.fromJS = undefined;
exports.parseString = parseString;
exports.parse = parse;
exports.doc = doc;
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

var _json = require("./json");

Object.defineProperty(exports, "fromJS", {
	enumerable: true,
	get: function get() {
		return _json.fromJS;
	}
});
Object.defineProperty(exports, "toJS", {
	enumerable: true,
	get: function get() {
		return _json.toJS;
	}
});
Object.defineProperty(exports, "iterJS", {
	enumerable: true,
	get: function get() {
		return _json.iter;
	}
});
Object.defineProperty(exports, "jsToL3", {
	enumerable: true,
	get: function get() {
		return _json.toL3;
	}
});
Object.defineProperty(exports, "jsFromL3", {
	enumerable: true,
	get: function get() {
		return _json.fromL3;
	}
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

var _transducers = require("./transducers");

Object.keys(_transducers).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _transducers[key];
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

var inode = _interopRequireWildcard(_inode);

var _parser = require("./parser");

var _array = require("./array");

var array = _interopRequireWildcard(_array);

var _map = require("./map");

var map = _interopRequireWildcard(_map);

var _fs = require("fs");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function parseString(str, cb) {
	var parser = new _parser.Parser(inode);
	return parser.parseString(str, cb);
}

// TODO move to better location
// TODO update when loader spec is solid
// TODO add easy access to a xhr / db module
function parse($a) {
	var xml = (0, _seq.first)($a);
	var result;
	parseString(xml, function (err, ret) {
		if (err) console.log(err);
		result = ret;
	});
	return result;
}

function doc($file) {
	var file = (0, _seq.first)($file);
	return parse((0, _fs.readFileSync)(file.toString(), "utf-8"));
}

function collection($uri) {
	var uri = (0, _seq.first)($uri);
	return (0, _seq.seq)((0, _fs.readdirSync)(uri).map(function (file) {
		return doc(uri + "/" + file);
	}));
}

exports.array = array;
exports.map = map;