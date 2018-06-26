const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

console.log("testing access-streaming");

var e = n.e("test",n.seq(n.e("a","bla"),n.e("b","bli")));
n.childrenStreaming(n.vdoc(e),"b",n.text()).subscribe(x => console.log(x+""));
