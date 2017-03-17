import { Parser } from "./parser";

export function parseString(str, cb) {
    var parser = new Parser();
    return parser.parseString(str, cb);
}

export { elem, attr, text , cdata, comment, processingInstruction, qname } from "./vnode";

export { appendChild, insertBefore, removeChild } from "./modify";

export { iter, docIter, nextNode, firstChild, nextSibling, parent, children, childrenByName, stringify } from "./access";

export { fromL3, toL3 } from "./l3";

export { fromJS, toJS } from "./json";
