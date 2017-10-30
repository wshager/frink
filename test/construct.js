const n = require("../lib/index");

/*var e = n.m([
	n.a("x",
		n.l([n.x("bla"),n.x("bli")])
	),
	n.a("y",n.l())
]);*/
var e = n.e("test",n.seq(n.a("a","bla"),n.e("b","bli")));
n.ensureDoc(e).subscribe(x => console.log(x+""));
