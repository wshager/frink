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

var _construct = require("./construct");

var _modify = require("./modify");

var _access = require("./access");

var _transducers = require("./transducers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _regexpCache = {};

function _cached(pat) {
	pat = pat.toString();
	if (pat in _regexpCache) return _regexpCache[pat];
	var regex = (0, _xregexp2.default)(pat, "g");
	_regexpCache[pat] = regex;
	return regex;
}

var _replaceCache = {};

// FIXME move to transpiler!
function _repcached(rep) {
	rep = rep.toString();
	if (rep in _replaceCache) return _replaceCache[rep];
	var normal = rep.replace(/(^|[^\\])\\\$/g, "$$$$").replace(/\\\\\$/g, "\\$$");
	_replaceCache[rep] = normal;
	return normal;
}

function analyzeString($str, $pat) {
	var str = (0, _seq.first)((0, _type.string)($str));
	var ret = (0, _construct.e)("fn:analyze-string-result");
	var index = 0;
	if (str) {
		var pat = (0, _seq.first)($pat);
		_xregexp2.default.replace(str.toString(), _cached(pat), function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var match = args.shift();
			var str = args.pop();
			var idx = args.pop();
			// the rest is groups
			if (idx > index) ret = (0, _modify.appendChild)(ret, (0, _construct.e)("fn:non-match", (0, _construct.x)(str.substring(index, idx))));
			index = idx + match.length;
			var len = args.length;
			var me = (0, _construct.e)("fn:match");
			if (len > 0) {
				var children = [];
				for (var i = 0; i < len; i++) {
					var _ = args[i];
					if (_ !== undefined) {
						// nest optional groups that are empty
						// TODO nested groups
						if (_ !== "") {
							children[i] = (0, _construct.e)("fn:group", (0, _seq.seq)((0, _construct.a)("nr", Number(i + 1)), (0, _construct.x)(_)));
						} else {
							var clen = children.length;
							if (clen) {
								var last = children[clen - 1];
								last = (0, _modify.appendChild)(last, (0, _construct.e)("fn:group", (0, _seq.seq)((0, _construct.a)("nr", Number(i + 1)))));
							}
						}
					}
					if (children[i]) me = (0, _modify.appendChild)(me, children[i]);
				}
				if (children.length) ret = (0, _modify.appendChild)(ret, me);
			} else if (match) {
				me = (0, _modify.appendChild)(me, (0, _construct.x)(match));
				ret = (0, _modify.appendChild)(ret, me);
			}
		});
		if (index < str.length) ret = (0, _modify.appendChild)(ret, (0, _construct.e)("fn:non-match", (0, _construct.x)(str.substr(index))));
	}
	return ret;
}

function tokenize($str, $pat) {
	var str = (0, _seq.first)((0, _type.string)($str));
	if (!str) return (0, _seq.seq)();
	var pat = (0, _seq.first)($pat);
	return (0, _transducers.into)(str.toString().split(_cached(pat)), (0, _transducers.forEach)(function (s) {
		return (0, _type.string)(s);
	}), (0, _seq.seq)());
}

function substring($str, $s, $l) {
	var str = (0, _seq.first)((0, _type.string)($str)),
	    s = Math.round((0, _seq.first)($s)) - 1;
	if (!$l) return str.substring(s);
	var l = (0, _seq.first)($l);
	return (0, _type.string)(str.substring(s, s + Math.round(l)));
}

function stringToCodepoints($str) {
	var str = (0, _seq.first)((0, _type.string)($str));
	var ret = [];
	for (var i = 0, l = str.length; i < l; i++) {
		ret[i] = str.codePointAt(i);
	}
	return (0, _seq.seq)(ret);
}

function codepointsToString($seq) {
	return (0, _type.string)((0, _transducers.foldLeft)($seq, "", function (acc, _) {
		return acc + String.fromCodePoint(_);
	}));
	//return seq($seq.map(_ => String.fromCodePoint(_)).join(""));
}

function upperCase($str) {
	return (0, _type.string)((0, _seq.first)((0, _type.string)($str)).toUpperCase());
}

function lowerCase($str) {
	return (0, _type.string)((0, _seq.first)((0, _type.string)($str)).toLowerCase());
}

function normalizeSpace($str) {
	return (0, _type.string)((0, _seq.first)((0, _type.string)($str)).replace(/^[\x20\x9\xD\xA]+|[\x20\x9\xD\xA]+$/g, "").replace(/[\x20\x9\xD\xA]+/g, " "));
}

function matches($str, $pat) {
	var str = (0, _seq.first)((0, _type.string)($str));
	var pat = (0, _seq.first)($pat);
	if (pat === undefined) return error("xxx");
	if (str === undefined) return (0, _seq.seq)(false);
	return !!str.valueOf().match(_cached(pat));
}

function replace($str, $pat, $rep) {
	var str = (0, _seq.first)((0, _type.string)($str)),
	    pat = (0, _seq.first)($pat),
	    rep = (0, _seq.first)($rep);
	if (pat === undefined || rep === undefined) return error("xxx");
	if (str === undefined) return (0, _seq.seq)();
	return (0, _type.string)(_xregexp2.default.replace(str.valueOf(), _cached(pat), _repcached(rep), "all"));
}

var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function stringLength($str) {
	var str = (0, _seq.first)((0, _type.string)($str));
	if (str === undefined) return (0, _seq.seq)();
	return str.replace(regexAstralSymbols, "_").toString().length;
}

function stringJoin($seq, $sep) {
	var sep = (0, _seq.first)($sep);
	return (0, _type.string)((0, _transducers.into)($seq, (0, _transducers.forEach)(function (s) {
		return (0, _type.string)(s);
	}), []).join(sep !== undefined ? sep : ""));
}

function concat() {
	for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		args[_key2] = arguments[_key2];
	}

	return (0, _type.string)((0, _transducers.transform)(args, (0, _transducers.compose)((0, _transducers.forEach)(function (s) {
		return (0, _type.string)(s);
	}), _transducers.cat)).join(""));
}

function normalizeUnicode($str, $form) {
	var str = (0, _seq.first)((0, _type.string)($str));
	var form = (0, _seq.first)($form);
	return !str ? (0, _seq.seq)() : (0, _type.string)(!form ? str.normalize() : str.normalize(form.toUpperCase()));
}