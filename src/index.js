import { Parser } from "./parser";

export function parseString(str, cb) {
    var parser = new Parser();
    return parser.parseString(str, cb);
}

export * from "./vnode";

export { appendChild, insertBefore as insertChildBefore, removeChild } from "./modify";

export * from "./access";

export * from "./l3";

export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";

export { seq, isSeq, first, isEmpty as isEmptySeq, empty, exists, count, insertBefore, zeroOrOne, oneOrMore, exactlyOne } from "./seq";

export * from "./subseq";

export * from "./transducers";

export * from "./type";

export * from "./string";

export * from "./function";

export * from "./op";
