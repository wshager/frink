const n = require("../lib/index");

var e = n.m([n.a("x",n.l([n.x("bla"),n.x("bli")]))]);
//var e = n.e("test",[n.a("x","test"),n.x("bla")]);
//n.ensureDoc(e);
n.iter(e,x => console.log(x.toString()));
