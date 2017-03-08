const n = require("../lib/xvptree");

var e = n.elem("test",[n.text("bla")]);
var d = n.appendChild(n.doc(),e);
console.log(d)
var x = n.appendChild(n.nextNode(d),e);
console.log(x.toString());
