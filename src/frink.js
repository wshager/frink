import FastIntCompression from "fastintcompression";

const compress = FastIntCompression.compress;
const uncompress = FastIntCompression.uncompress;

export { e, a, x, l, m, p, q } from "./vnode";

export { appendChild, insertBefore, removeChild } from "./modify";

export { docIter, nextNode, firstChild, nextSibling, parent, children, childrenByName } from "./access";

export { fromL3, toL3 } from "./l3";

export { render } from "./render";

export { compress, uncompress };
