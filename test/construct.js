const n = require("../lib/index");

/*var e = n.m([
	n.a("x",
		n.l([n.x("bla"),n.x("bli")])
	),
	n.a("y",n.l())
]);*/
var e = n.e("test",n.seq(n.e("a","bla"),n.e("b","bli")));
n.nextSibling(n.firstChild(e)).subscribe(x => console.log(x+""));
//var e = n.e("test",[n.a("x","test"),n.x("bla")]);
//n.ensureDoc(e);
//n.iter(e,x => console.log(x.toString()));
//Rx.Observable.from(n.select(e,n.list("*")).iterable).subscribe(x => console.log(x+""));
