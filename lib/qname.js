"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isQName = isQName;
exports.QName = QName;
function isQName(maybe) {
  return !!(maybe && maybe.__is_QName);
}

function QName(uri, name) {
  var prefix = /:/.test(name) ? name.replace(/:.+$/, "") : null;
  return {
    __is_QName: true,
    name: name,
    prefix: prefix,
    uri: uri
  };
}

var q = exports.q = QName;