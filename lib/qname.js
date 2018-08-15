"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isQName = isQName;
exports.QName = QName;
exports.q = void 0;

function isQName(maybe) {
  return !!(maybe && maybe.__is_QName);
}

function QName(uri, name) {
  var prefix = /:/.test(name) ? name.replace(/:.+$/, "") : null;
  return {
    __is_QName: true,
    name: name,
    prefix,
    uri: uri
  };
}

const q = QName;
exports.q = q;
//# sourceMappingURL=qname.js.map