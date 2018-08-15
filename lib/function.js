"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadModule = loadModule;
exports.functionLookup = functionLookup;
exports.apply = apply;

var _util = require("./util");

var _map = require("./map");

const modules = {
  "http://www.w3.org/2005/xpath-functions": "./function"
};

function loadModule(moduleUri) {
  // conflict?
  //if (module.uri in modules) return;
  // let js manager handle logic
  return (0, _map.map)(require(modules[moduleUri]));
}

function functionLookup(qname, arity) {
  var uri = qname.uri.toString();
  var name = (0, _util.camelCase)(qname.name.toString().split(/:/).pop());
  var fn = modules[uri][name + "$" + arity];
  if (!fn) fn = modules[uri][name + "$"];
  return fn ? fn : null;
}

function apply(fn, a) {
  return fn.apply(this, a.toJS ? a.toJS() : a);
}
//# sourceMappingURL=function.js.map