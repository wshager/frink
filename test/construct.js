const n = require("../lib/index");
const a = require("../lib/array");
const fn = require("../lib/function");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

const toObj = $m => $m.reduce((a,m) => {
	for(var kv of m.entries()) {
		a[kv[0]] = kv[1];
	}
	return a;
},{});

var e = n.e("test",n.seq(n.a("a","bla"),n.p("b","bli")));
n.ensureDoc(e).subscribe(x => console.log(x+""));
var m = n.m([
	n.a("x",
		n.l([n.x("bla"),n.x("bli")])
	),
	n.a("y",n.l())
]);
n.ensureDoc(m).subscribe(x => console.log(x+""));
