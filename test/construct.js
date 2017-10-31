const n = require("../lib/index");

var e = n.e("test",n.seq(n.a("a","bla"),n.e("b","bli")));
n.ensureDoc(e).subscribe(x => console.log(x+""));
var m = n.m([
	n.a("x",
		n.l([n.x("bla"),n.x("bli")])
	),
	n.a("y",n.l())
]);
n.ensureDoc(m).subscribe(x => console.log(x+""));
