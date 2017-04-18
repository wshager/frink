const n = require("../lib/index");
const assert = require("assert");
const a = require("../lib/access");

function assertEq(a,b){
	assert.equal(JSON.stringify(a),JSON.stringify(b));
}
var x = n.analyzeString("1 + 1","(\\)[\\+\\*\\-\\?]?)|(=#\\p{N}+#?\\p{N}*=|,)?([\\+\\*\\-\\?\\p{L}\\p{N}\\-_\\.@\\$%/#@\\^:]*)(\\(?)");
var ret = n.select(x,"*",n.string);
//console.log(ret.toString());
//var h = n.head(ret);
//var t = n.tail(ret);
console.log(n.concat(ret))
