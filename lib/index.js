"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.jsFromL3 = exports.jsToL3 = exports.iterJS = exports.toJS = exports.fromJS = undefined;
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// TODO move to better location
// TODO update when loader spec is solid
// TODO add easy access to a xhr / db module
var isNode = void 0,
	readFile = void 0,
	readdir = void 0;
// Only Node.JS has a process variable that is of [[Class]] process
try {
	isNode = Object.prototype.toString.call(global.process) === "[object process]";
} catch (e) {
	isNode = false;
}
if (isNode) {
	if (!global.URL) {
		var url = require("url");
		global.URL = url.URL;
	}
	var fs = require("fs");
	/*readFile = (source, encoding = "utf-8") => new Promise((resolve,reject) => {
 	fs.readFile(source,encoding,(err,contents) => {
 		if(err) return reject(err);
 		resolve(contents);
 	});
 });*/
	readFile = fs.readFile;
	readdir = fs.readdir;
} else {
	readFile = function readFile(source, cb) {
		var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "utf-8";

		var reader = new FileReader();
		reader.onloadend = function (evt) {
			// file is loaded
			cb(null, evt.target.result);
		};
		reader.onerror = function (err) {
			cb(err);
		};
		reader.readAsText(source, encoding);
	};
}

function parseString(str, cb) {
	var parser = new _parser.Parser(inode);
	return parser.parseString(str, cb);
}

function parse($s) {
	return (0, _seq.zeroOrOne)($s).concatMap(function (s) {
		return (0, _seq.create)(function (o) {
			parseString(s, function (err, ret) {
				if (err) return o.error(err);
				o.next(ret);
				o.complete();
			});
		});
	}).share();
}

function doc($file) {
	return (0, _seq.zeroOrOne)($file).concatMap(function (file) {
		return (0, _seq.create)(function (o) {
			readFile(file.toString(), function(err,res){
				if(err) return o.error(err);
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
	}).share();
}

function collection($uri) {
	return (0, _seq.zeroOrOne)($uri).concatMap(function (uri) {
		return (0, _seq.create)(function (o) {
			readdir(uri, function (err, res) {
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
