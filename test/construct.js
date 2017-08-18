const n = require("../lib/index");

var e = n.e("test",[n.x("bla")]);
console.log(n.ensureDoc(e).toString());
