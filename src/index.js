import { Parser } from "./parser";

export function parseString(str, cb) {
    var parser = new Parser();
    return parser.parseString(str, cb);
}

export { element, attribute, text , cdata, comment, processingInstruction, qname } from "./vnode";

export { appendChild, insertBefore } from "./modify";

export { docIter, nextNode, firstChild, nextSibling, parent, children, childrenByName } from "./access";
