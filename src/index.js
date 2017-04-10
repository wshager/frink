import { Parser } from "./parser";

export function parseString(str, cb) {
    var parser = new Parser();
    return parser.parseString(str, cb);
}

export { e, a, x, d, m, l, c, p, q } from "./vnode";

export { appendChild, insertBefore as insertChildBefore, removeChild } from "./modify";

export { iter, docIter, nextNode, firstChild, nextSibling, parent, children, childrenByName, stringify, element, node, text, attribute, select, child, position, followingSibling, isNode, isEmptyNode, name } from "./access";

export { fromL3, toL3 } from "./l3";

export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";

export { seq, isSeq, first, isEmpty as isEmptySeq, empty, exists, count, insertBefore } from "./seq";

export { subsequence, head, tail, remove, reverse } from "./subseq";

export { forEach, filter, foldLeft, cat, get, transform, compose, into, take, drop } from "./transducers";

export { data, decimal, integer, string, number, double, float, boolean, cast, logic, op, instanceOf, minus, f, t } from "./type";

export { analyzeString, tokenize, substring, stringToCodepoints, codepointsToString, upperCase, lowerCase, normalizeSpace, matches, replace, stringLength, stringJoin, concat, normalizeUnicode } from "./string";

export { doc, collection, parse, module, functionLookup, apply, sort, error } from "./function";

export * from "./op";
