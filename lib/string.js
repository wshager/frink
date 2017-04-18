"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.analyzeString = analyzeString;
exports.tokenize = tokenize;
exports.substring = substring;
exports.stringToCodepoints = stringToCodepoints;
exports.codepointsToString = codepointsToString;
exports.upperCase = upperCase;
exports.lowerCase = lowerCase;
exports.normalizeSpace = normalizeSpace;
exports.matches = matches;
exports.replace = replace;
exports.stringLength = stringLength;
exports.stringJoin = stringJoin;
exports.concat = concat;
exports.normalizeUnicode = normalizeUnicode;

var _xregexp = require("xregexp");

var _xregexp2 = _interopRequireDefault(_xregexp);

var _seq = require("./seq");

var _type = require("./type");

var _vnode = require("./vnode");

var _modify = require("./modify");

var _access = require("./access");

var _transducers = require("./transducers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _regexpCache = {};

function _cached(pat) {
	pat = pat.toString();
	if (pat in _regexpCache) return _regexpCache[pat];
	var regex = _xregexp2.default(pat, "g");
	_regexpCache[pat] = regex;
	return regex;
}

const _replaceCache = {};

// FIXME move to transpiler!
function _repcached(rep) {
	rep = rep.toString();
	if (rep in _replaceCache) return _replaceCache[rep];
	var normal = rep.replace(/(^|[^\\])\\\$/g, "$$$$").replace(/\\\\\$/g, "\\$$");
	_replaceCache[rep] = normal;
	return normal;
}

function analyzeString($str, $pat) {
	var str = _seq.first(_type.string($str));
	var ret = _vnode.e("fn:analyze-string-result");
	var index = 0;
	if (str) {
		let pat = _seq.first($pat);
		_xregexp2.default.replace(str.toString(), _cached(pat), function (...args) {
			var match = args.shift();
			var str = args.pop();
			var idx = args.pop();
			// the rest is groups
			if (idx > index) ret = _modify.appendChild(ret, _vnode.e("fn:non-match", _vnode.x(str.substring(index, idx))));
			index = idx + match.length;
			var len = args.length;
			var me = _vnode.e("fn:match");
			if (len > 0) {
				var children = [];
				for (let i = 0; i < len; i++) {
					let _ = args[i];
					if (_ !== undefined) {
						// nest optional groups that are empty
						// TODO nested groups
						if (_ !== "") {
							children[i] = _vnode.e("fn:group", _seq.seq(_vnode.a("nr", Number(i + 1)), _vnode.x(_)));
						} else {
							var clen = children.length;
							if (clen) {
								var last = children[clen - 1];
								last = _modify.appendChild(last, _vnode.e("fn:group", _vnode.a("nr", Number(i + 1))));
							}
						}
					}
					if (children[i]) me = _modify.appendChild(me, children[i]);
				}
				if (children.length) ret = _modify.appendChild(ret, me);
			} else if (match) {
				me = _modify.appendChild(me, _vnode.x(match));
				ret = _modify.appendChild(ret, me);
			}
		});
		if (index < str.length) ret = _modify.appendChild(ret, _vnode.e("fn:non-match", _vnode.x(str.substr(index))));
	}
	return ret;
}

function tokenize($str, $pat) {
	var str = _seq.first(_type.string($str));
	if (!str) return _seq.seq();
	let pat = _seq.first($pat);
	return _transducers.into(str.toString().split(_cached(pat)), _transducers.forEach(s => _type.string(s)), _seq.seq());
}

function substring($str, $s, $l) {
	var str = _seq.first(_type.string($str)),
	    s = Math.round(_seq.first($s)) - 1;
	if (!$l) return _.substring(s);
	var l = _seq.first($l);
	return _type.string(str.substring(s, s + Math.round(l)));
}

function stringToCodepoints($str) {
	var str = _seq.first(_type.string($str));
	var ret = [];
	for (var i = 0, l = str.length; i < l; i++) {
		ret[i] = str.codePointAt(i);
	}
	return _seq.seq(ret);
}

function codepointsToString($seq) {
	return _type.string(_transducers.foldLeft($seq, "", (acc, _) => acc + String.fromCodePoint(_)));
	//return seq($seq.map(_ => String.fromCodePoint(_)).join(""));
}

function upperCase($str) {
	return _type.string(_seq.first(_type.string($str)).toUpperCase());
}

function lowerCase($str) {
	return _type.string(_seq.first(_type.string($str)).toLowerCase());
}

function normalizeSpace($str) {
	return _type.string(_seq.first(_type.string($str)).replace(/^[\x20\x9\xD\xA]+|[\x20\x9\xD\xA]+$/g, "").replace(/[\x20\x9\xD\xA]+/g, " "));
}

function matches($str, $pat) {
	var str = _seq.first(_type.string($str));
	var pat = _seq.first($pat);
	if (pat === undefined) return error("xxx");
	str = _access.isNode(str) ? _type.data(str) : str;
	if (str === undefined) return _seq.seq(false);
	return !!str.toString().match(_cached(pat));
}

function replace($str, $pat, $rep) {
	var str = _seq.first(_type.string($str)),
	    pat = _seq.first($pat),
	    rep = _seq.first($rep);
	if (pat === undefined || rep === undefined) return error("xxx");
	if (str === undefined) return _seq.seq();
	return _type.string(_xregexp2.default.replace(str.toString(), _cached(pat), _repcached(rep), "all"));
}

const regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function stringLength($str) {
	let str = _seq.first(_type.string($str));
	if (str === undefined) return _seq.seq();
	return str.replace(regexAstralSymbols, "_").toString().length;
}

function stringJoin($seq, $sep) {
	let sep = _seq.first($sep);
	return _type.string(_transducers.into($seq, _transducers.forEach(s => _type.string(s)), []).join(sep !== undefined ? sep : ""));
}

function concat(...a) {
	return _type.string(_transducers.transform(a, _transducers.compose(_transducers.forEach(s => _type.string(s)),_transducers.cat)).join(""));
}

function normalizeUnicode($str, $form) {
	var str = _seq.first(_type.string($str));
	var form = _seq.first($form);
	return !str ? _seq.seq() : _type.string(!form ? str.normalize() : str.normalize(form.toUpperCase()));
}
