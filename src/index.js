import { Parser } from "./parser";

export function parseString(str, cb) {
    var parser = new Parser();
    return parser.parseString(str, cb);
}

export { e, a, t, d , cdata, comment, processingInstruction, qname } from "./vnode";

export { appendChild, insertBefore, removeChild } from "./modify";

export { iter, docIter, nextNode, firstChild, nextSibling, parent, children, childrenByName, stringify, element, node, text, attribute, select, child } from "./access";

export { fromL3, toL3 } from "./l3";

export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";

export { seq, isSeq, toSeq } from "./seq";

export { forEach, filter, foldLeft, cat, get, transform, compose, into } from "./transducers";
