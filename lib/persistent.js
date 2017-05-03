"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.jsFromL3 = exports.jsToL3 = exports.iterJS = exports.toJS = exports.fromJS = exports.toL3 = exports.fromL3 = exports.select = exports.lastChild = exports.firstChild = exports.removeChild = exports.insertChildBefore = exports.appendChild = exports.d = exports.ensureDoc = undefined;
exports.parseString = parseString;
exports.parse = parse;
exports.doc = doc;
exports.collection = collection;

var _json = require("./json");

Object.defineProperty(exports, "fromJS", {
    enumerable: true,
    get: function () {
        return _json.fromJS;
    }
});
Object.defineProperty(exports, "toJS", {
    enumerable: true,
    get: function () {
        return _json.toJS;
    }
});
Object.defineProperty(exports, "iterJS", {
    enumerable: true,
    get: function () {
        return _json.iter;
    }
});
Object.defineProperty(exports, "jsToL3", {
    enumerable: true,
    get: function () {
        return _json.toL3;
    }
});
Object.defineProperty(exports, "jsFromL3", {
    enumerable: true,
    get: function () {
        return _json.fromL3;
    }
});

var _construct = require("./construct");

Object.keys(_construct).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _construct[key];
        }
    });
});

var _qname = require("./qname");

Object.keys(_qname).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _qname[key];
        }
    });
});

var _seq = require("./seq");

Object.keys(_seq).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _seq[key];
        }
    });
});

var _subseq = require("./subseq");

Object.keys(_subseq).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _subseq[key];
        }
    });
});

var _transducers = require("./transducers");

Object.keys(_transducers).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _transducers[key];
        }
    });
});

var _type = require("./type");

Object.keys(_type).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _type[key];
        }
    });
});

var _string = require("./string");

Object.keys(_string).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _string[key];
        }
    });
});

var _function = require("./function");

Object.keys(_function).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _function[key];
        }
    });
});

var _op = require("./op");

Object.keys(_op).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _op[key];
        }
    });
});

var _persist = require("./persist");

var inode = _interopRequireWildcard(_persist);

var _parser = require("./parser");

var _doc = require("./doc");

var dc = _interopRequireWildcard(_doc);

var _modify = require("./modify");

var md = _interopRequireWildcard(_modify);

var _access = require("./access");

var ac = _interopRequireWildcard(_access);

var _l = require("./l3");

var l3 = _interopRequireWildcard(_l);

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
    var xml = first($a);
    var result;
    parseString(xml, function (err, ret) {
        if (err) console.log(err);
        result = ret;
    });
    return result;
}

function doc($file) {
    var file = first($file);
    return parse(_fs.readFileSync(file.toString(), "utf-8"));
}

function collection($uri) {
    var uri = first($uri);
    return seq(readDirSync(uri).map(file => doc(uri + "/" + file)));
}

const ensureDoc = exports.ensureDoc = dc.ensureDoc.bind(inode);

const d = exports.d = dc.d.bind(inode);

const appendChild = exports.appendChild = md.appendChild.bind(inode);

const insertChildBefore = exports.insertChildBefore = md.insertChildBefore.bind(inode);

const removeChild = exports.removeChild = md.removeChild.bind(inode);

const firstChild = exports.firstChild = ac.firstChild.bind(inode);

const lastChild = exports.lastChild = ac.lastChild.bind(inode);

const select = exports.select = ac.select.bind(inode);

const fromL3 = exports.fromL3 = l3.fromL3.bind(inode);

const toL3 = exports.toL3 = l3.toL3.bind(inode);

// TODO