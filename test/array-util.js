var n = require("../lib/index");
var array = require("../lib/array");
const a = require("../lib/array-util.js");
//const console=require("../lib/console");
var x = n.to(0,10)

async function sum$2(acc,x){
	return n.add(acc,x)
}

function sum(...a) {
	return n.fromPromise(sum$2.apply(null,a));
}

n.seq(n.foldLeft(x,0,sum)).subscribe({next: x => console.log(x),error: err => console.error(err), complete: () => console.log("complete")});
