"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contains = contains;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.substringBefore = substringBefore;
exports.substringAfter = substringAfter;

//import { defaultCollation } from "./env";
function contains(a, b
/*, collation = defaultCollation()*/
) {
  return a.includes(b);
}

function startsWith(a, b) {
  return a.startsWith(b);
}

function endsWith(a, b) {
  return a.endsWith(b);
}

function substringBefore(a, b) {
  const idx = a.indexOf(b);
  return idx > -1 ? a.substr(0, idx) : "";
}

function substringAfter(a, b) {
  const idx = a.indexOf(b) + 1;
  return idx ? a.substr(idx) : "";
}
//# sourceMappingURL=substring-match.js.map