var n = require("../lib/index");
var array = require("../lib/array");
const a = require("../lib/array-util.js");
//const console=require("../lib/console");
var x = array.array(n.to(1,20));
//var x = n.to(1,500);
a.foldLeftAt(x,n.seq(0),function(acc,x){
	//console.log("acc",acc,x);
	return n.add(acc,x);
}).subscribe(console.log);
