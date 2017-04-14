const n = require("../lib/index");
const assert = require("assert");
const t = require("../lib/transducers");
const a = require("../lib/access");

function assertEq(a,b){
	assert.equal(JSON.stringify(a),JSON.stringify(b));
}
var x = n.analyzeString("1+1","(\\)[\\+\\*\\-\\?]?)|(=#\\p{N}+#?\\p{N}*=|,)?([\\+\\*\\-\\?\\p{L}\\p{N}\\-_\\.@\\$%/#@\\^:]*)(\\(?)");
var ret = n.select(x,"*");
console.log(ret.toString());
