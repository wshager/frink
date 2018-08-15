"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadModule = loadModule;
exports.functionLookup = functionLookup;
exports.apply = apply;
exports.sort = sort;

var _seq = require("./seq");

var _card = require("./seq/card");

var _util = require("./util");

var map = _interopRequireWildcard(require("./map"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const modules = {
  "http://www.w3.org/2005/xpath-functions": "./function"
};

function loadModule($moduleUri) {
  // conflict?
  //if (module.uri in modules) return;
  // let js manager handle logic
  return (0, _card.exactlyOne)($moduleUri).concatMap(moduleUri => map.default(require(modules[moduleUri])));
}

function functionLookup($qname, $arity) {
  return (0, _card.exactlyOne)($qname).concatMap(qname => {
    return (0, _card.exactlyOne)($arity).concatMap(arity => {
      var uri = qname.uri.toString();
      var name = (0, _util.camelCase)(qname.name.toString().split(/:/).pop());
      var fn = modules[uri][name + "$" + arity];
      if (!fn) fn = modules[uri][name + "$"];
      return fn ? (0, _seq.seq)(fn) : (0, _seq.seq)();
    });
  });
}

function apply($fn, $a) {
  return (0, _card.exactlyOne)($fn).concatMap(fn => (0, _card.exactlyOne)($a).concatAll().toArray().map(a => fn.apply(this, a)));
} // FIXME check if seq + apply data


function sort($s, $fn) {
  var crit = function (a, b) {
    const hasComp = typeof a == "object" && "gt" in a;

    const gt = (a, b) => hasComp ? a.gt(b) : a > b;

    const lt = (a, b) => hasComp ? a.lt(b) : a < b;

    return gt(a, b) ? 1 : lt(a, b) ? -1 : 0;
  };

  return (0, _seq.seq)($s).toArray().concatMap(a => (0, _util.isUndef)($fn) ? (0, _seq.seq)(a.sort(crit)) : (0, _seq.seq)($fn).concatMap(fn => a.sort(fn)));
}
//# sourceMappingURL=function.js.map