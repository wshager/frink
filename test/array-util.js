var n = require("../lib/index");
var array = require("../lib/array");
const a = require("../lib/array-util.js");

var x = array.default(1,2,3);
console.log(a);
a.last(x).subscribe(a => console.log("a",a));
