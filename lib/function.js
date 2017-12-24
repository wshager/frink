"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.loadModule = loadModule;
exports.functionLookup = functionLookup;
exports.apply = apply;
exports.sort = sort;

var _seq = require("./seq");

var _util = require("./util");

var _map = require("./map");

var map = _interopRequireWildcard(_map);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var modules = {
	"http://www.w3.org/2005/xpath-functions": "./function"
};

function loadModule($moduleUri) {
	// conflict?
	//if (module.uri in modules) return;
	// let js manager handle logic
	return (0, _seq.exactlyOne)($moduleUri).concatMap(function (moduleUri) {
		return map.default(require(modules[moduleUri]));
	});
}

function functionLookup($qname, $arity) {
	return (0, _seq.exactlyOne)($qname).concatMap(function (qname) {
		return (0, _seq.exactlyOne)($arity).concatMap(function (arity) {
			var uri = qname.uri.toString();
			var name = (0, _util.camelCase)(qname.name.toString().split(/:/).pop());
			var fn = modules[uri][name + "$" + arity];
			if (!fn) fn = modules[uri][name + "$"];
			return fn ? (0, _seq.seq)(fn) : (0, _seq.seq)();
		});
	});
}

function apply($fn, $a) {
	var _this = this;

	return (0, _seq.exactlyOne)($fn).concatMap(function (fn) {
		return (0, _seq.exactlyOne)($a).concatAll().toArray().map(function (a) {
			return fn.apply(_this, a);
		});
	});
}

// FIXME check if seq + apply data
function sort($s, $fn) {
	var crit = function crit(a, b) {
		var hasComp = (typeof a === "undefined" ? "undefined" : _typeof(a)) == "object" && "gt" in a;
		var gt = function gt(a, b) {
			return hasComp ? a.gt(b) : a > b;
		};
		var lt = function lt(a, b) {
			return hasComp ? a.lt(b) : a < b;
		};
		return gt(a, b) ? 1 : lt(a, b) ? -1 : 0;
	};
	return (0, _seq.seq)($s).toArray().concatMap(function (a) {
		return (0, _util.isUndef)($fn) ? (0, _seq.seq)(a.sort(crit)) : (0, _seq.seq)($fn).concatMap(function (fn) {
			return a.sort(fn);
		});
	});
}