"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.error = exports.module = undefined;
exports.functionLookup = functionLookup;
exports.doc = doc;
exports.collection = collection;
exports.parse = parse;
exports.apply = apply;
exports.sort = sort;

var _type = require("./type");

var _seq = require("./seq");

var _access = require("./access");

var _transducers = require("./transducers");

var _error = require("./error");

var _parser = require("./parser");

var _op = require("./op");

var _fs = require("fs");

const parser = new _parser.Parser();

// TODO update when loader spec is solid
// TODO add easy access to a xhr / db module

const modules = {
    "http://www.w3.org/2005/xpath-functions": exports
};

function _module(location) {
    // conflict?
    //if (module.uri in modules) return;
    var module = require(location);
    modules[module.$uri] = module;
    return module;
}

exports.module = _module;
function camelCase(str) {
    return str.split(/-/g).map((_, i) => i > 0 ? _.charAt(0).toUpperCase() + _.substr(1) : _).join("");
}

function functionLookup($name, $arity) {
    var qname = (0, _seq.first)($name);
    var arity = (0, _seq.first)($arity);
    var uri = (0, _seq.first)(qname._uri).toString();
    var name = camelCase((0, _seq.first)(qname._name).toString().split(/:/).pop());
    var fn = modules[uri][name + "$" + arity];
    if (!fn) fn = modules[uri][name + "$"];
    return !!fn ? fn : (0, _seq.seq)();
}

function doc($file) {
    var file = (0, _seq.first)($file);
    return parse((0, _fs.readFileSync)(file.valueOf(), "utf-8"));
}

function collection($uri) {
    var uri = (0, _seq.first)($uri);
    return (0, _seq.seq)(readDirSync(uri).map(file => doc(uri + "/" + file)));
}

function parse($a) {
    var xml = (0, _seq.first)($a);
    var result;
    parser.parseString(xml, function (err, ret) {
        if (err) console.log(err);
        result = ret;
    });
    return result;
}

function apply($fn, $a) {
    var a = (0, _seq.first)($a);
    if (!(a instanceof Array)) {
        if (typeof a.toArray != "function") return (0, _error.error)("");
    }
    return (0, _seq.first)($fn).apply(this, a.toArray());
}

// FIXME check if seq + apply data
function sort(...args) {
    var l = args.length;
    var s = args[0];
    if (!(0, _seq.isSeq)(s)) return s;
    var crit = l > 1 ? (0, _seq.first)(a[1]) : function (a, b) {
        var gt = (0, _op.ggt)(a, b);
        var lt = (0, _op.glt)(a, b);
        return gt ? 1 : lt ? -1 : 0;
    };
    return (0, _seq.seq)(s.toArray().sort(crit));
}

exports.error = _error.error;