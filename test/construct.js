const n = require("../lib/index");
const Rx = require("rxjs");

var e = n.m([
	n.a("x",
		n.l([n.x("bla"),n.x("bli")])
	),
	n.a("y",n.l())
]);
//var e = n.e("test",[n.a("x","test"),n.x("bla")]);
//n.ensureDoc(e);
//n.iter(e,x => console.log(x.toString()));
Rx.Observable.from(n.select(e,n.list("*")).iterable).subscribe(x => console.log(x+""));
