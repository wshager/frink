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

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _regexpCache = {};

//import { isVNode } from "./access";

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
	return (0, _type.string)($str).concatMap(function (str) {
		var $ret = (0, _construct.e)("fn:analyze-string-result");
		var index = 0;
		if (!str) return $ret;
		return (0, _seq.exactlyOne)($pat).concatMap(function (pat) {
			_xregexp2.default.replace(str.toString(), _cached(pat), function () {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				var match = args.shift();
				var str = args.pop();
				var idx = args.pop();
				// the rest is groups
				if (idx > index) $ret = (0, _modify.appendChild)($ret, (0, _construct.e)("fn:non-match", (0, _construct.x)(str.substring(index, idx))));
				index = idx + match.length;
				var len = args.length;
				var $me = (0, _construct.e)("fn:match");
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
									var $last = children[clen - 1];
									children[clen - 1] = (0, _modify.appendChild)($last, (0, _construct.e)("fn:group", (0, _seq.seq)((0, _construct.a)("nr", Number(i + 1)))));
								}
							}
						}
						if (children[i]) $me = (0, _modify.appendChild)($me, children[i]);
					}
					if (children.length) $ret = (0, _modify.appendChild)($ret, $me);
				} else if (match) {
					$me = (0, _modify.appendChild)($me, (0, _construct.x)(match));
					$ret = (0, _modify.appendChild)($ret, $me);
				}
			});
			if (index < str.length) $ret = (0, _modify.appendChild)($ret, (0, _construct.e)("fn:non-match", (0, _construct.x)(str.substr(index))));
			return $ret;
		});
	});
}

function tokenize($str, $pat) {
	return (0, _type.string)($str).concatMap(function (str) {
		return (0, _seq.exactlyOne)($pat).concatMap(function (pat) {
			return (0, _seq.seq)(str.toString().split(_cached(pat))).concatMap(function (s) {
				return (0, _type.string)(s);
			});
		});
	});
}

function substring($str, $s, $l) {
	return (0, _type.string)((0, _seq.zeroOrOne)($str)
	//.concatMap(str => string(str))
	.concatMap(function (str) {
		return (0, _seq.exactlyOne)($s).concatMap(function (s) {
			s = Math.round(s) - 1;
			return (0, _util.isUndef)($l) ? (0, _seq.seq)(str.substr(s)) : (0, _seq.exactlyOne)($l).map(function (l) {
				return str.substr(s, Math.round(l));
			});
		});
	}));
}

function stringToCodepoints($str) {
	return (0, _seq.zeroOrOne)($str).concatMap(function (str) {
		// TODO integer opt-in
		var ret = [];
		for (var i = 0, l = str.length; i < l; i++) {
			ret[i] = str.codePointAt(i);
		}
		return ret;
	});
}

function codepointsToString($seq) {
	return stringJoin((0, _seq.seq)($seq).map(function (_) {
		return String.fromCodePoint(_.valueOf());
	}));
}

function upperCase($str) {
	return (0, _type.string)((0, _seq.zeroOrOne)($str).map(function (str) {
		return str.toUpperCase();
	}));
}

function lowerCase($str) {
	return (0, _type.string)((0, _seq.zeroOrOne)($str).map(function (str) {
		return str.toLowerCase();
	}));
}

function normalizeSpace($str) {
	return (0, _type.string)((0, _seq.zeroOrOne)($str).map(function (str) {
		return str.replace(/^[\x20\x9\xD\xA]+|[\x20\x9\xD\xA]+$/g, "").replace(/[\x20\x9\xD\xA]+/g, " ");
	}));
}

function matches($str, $pat) {
	return (0, _seq.zeroOrOne)($str).concatMap(function (str) {
		return (0, _seq.exactlyOne)($pat).map(function (pat) {
			return _cached(pat).test(str.valueOf());
		});
	});
}

function replace($str, $pat, $rep) {
	return (0, _type.string)((0, _seq.zeroOrOne)($str).concatMap(function (str) {
		return (0, _seq.exactlyOne)($pat).concatMap(function (pat) {
			return (0, _seq.exactlyOne)($rep).map(function (rep) {
				return _xregexp2.default.replace(str.valueOf(), _cached(pat), _repcached(rep), "all");
			});
		});
	}));
}

function stringLength($str) {
	$str = (0, _seq.zeroOrOne)($str);
	return $str.isEmpty().concatMap(function (test) {
		return test ? (0, _seq.seq)(0) : $str.map(function (str) {
			return (0, _util.ucs2length)(str);
		});
	});
}

function stringJoin($seq, $sep) {
	// frink implementation allows passing a different cardinality test to string...
	return (0, _type.string)((0, _type.string)($seq, _seq.seq).reduce(function () {
		var acc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
		var _ = arguments[1];

		acc.push(_);
		return acc;
	}, undefined).concatMap(function (a) {
		return (0, _util.isUndef)($sep) ? (0, _seq.seq)(a.join("")) : (0, _seq.seq)($sep).map(function (sep) {
			return a.join(sep);
		});
	}));
}

function concat() {
	for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		args[_key2] = arguments[_key2];
	}

	return stringJoin((0, _seq.seq)(args));
}

function normalizeUnicode($str, $form) {
	return (0, _type.string)((0, _seq.zeroOrOne)($str).concatMap(function (str) {
		return (0, _util.isUndef)($form) ? (0, _seq.seq)(str.normalize()) : (0, _seq.seq)($form).map(function (form) {
			return str.normalize(form.toUpperCase());
		});
	}));
}