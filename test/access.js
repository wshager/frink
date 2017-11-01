const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

console.log("testing access");

var e = n.e("test",n.seq(n.e("a","bla"),n.e("b","bli")));
n.select(e,"a",n.text()).subscribe(x => console.log(x));
