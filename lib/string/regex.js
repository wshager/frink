"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matches = matches;
exports.replace = replace;
exports.tokenize = tokenize;
exports.analyzeString = analyzeString;

var _xregexp = _interopRequireDefault(require("xregexp"));

var _l3n = require("l3n");

var _modify = require("../modify");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _regexpCache = {};

function _cached(pat) {
  pat = pat.toString();
  if (pat in _regexpCache) return _regexpCache[pat];
  var regex = (0, _xregexp.default)(pat, "g");
  _regexpCache[pat] = regex;
  return regex;
}

const _replaceCache = {}; // FIXME move to transpiler!

function _repcached(rep) {
  rep = rep.toString();
  if (rep in _replaceCache) return _replaceCache[rep];
  var normal = rep.replace(/(^|[^\\])\\\$/g, "$$$$").replace(/\\\\\$/g, "\\$$");
  _replaceCache[rep] = normal;
  return normal;
}

function matches(str, pat) {
  return _cached(pat).test(str.valueOf());
}

function replace(str, pat, rep) {
  return _xregexp.default.replace(str.valueOf(), _cached(pat), _repcached(rep), "all");
}

function tokenize(str, pat) {
  return str.split(_cached(pat));
}

function analyzeString(str, pat) {
  var ret = (0, _l3n.e)("fn:analyze-string-result");
  var index = 0;
  if (!str) return ret;

  _xregexp.default.replace(str.toString(), _cached(pat), function (...args) {
    var match = args.shift();
    var str = args.pop();
    var idx = args.pop(); // the rest is groups

    if (idx > index) ret = (0, _modify.appendChild)(ret, (0, _l3n.e)("fn:non-match", (0, _l3n.x)(str.substring(index, idx))));
    index = idx + match.length;
    var len = args.length;
    var $me = (0, _l3n.e)("fn:match");

    if (len > 0) {
      var children = [];

      for (let i = 0; i < len; i++) {
        let _ = args[i];

        if (_ !== undefined) {
          // nest optional groups that are empty
          // TODO nested groups
          if (_ !== "") {
            children[i] = (0, _l3n.e)("fn:group", (0, _l3n.a)("nr", Number(i + 1), (0, _l3n.x)(_)));
          } else {
            var clen = children.length;

            if (clen) {
              var $last = children[clen - 1];
              children[clen - 1] = (0, _modify.appendChild)($last, (0, _l3n.e)("fn:group", (0, _l3n.a)("nr", Number(i + 1))));
            }
          }
        }

        if (children[i]) $me = (0, _modify.appendChild)($me, children[i]);
      }

      if (children.length) ret = (0, _modify.appendChild)(ret, $me);
    } else if (match) {
      $me = (0, _modify.appendChild)($me, (0, _l3n.x)(match));
      ret = (0, _modify.appendChild)(ret, $me);
    }
  });

  if (index < str.length) ret = (0, _modify.appendChild)(ret, (0, _l3n.e)("fn:non-match", (0, _l3n.x)(str.substr(index)))); // TODO finalize for persistent

  return ret;
}
//# sourceMappingURL=regex.js.map