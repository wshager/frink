const n = require("../lib/string");
const assert = require("assert");
const t = require("../lib/transducers");
const a = require("../lib/access");
const fn = require("../lib/type");

function assertEq(a,b){
	assert.equal(JSON.stringify(a),JSON.stringify(b));
}
var r = "(\\)[\\+\\*\\-\\?]?)|(=#\\p{N}+#?\\p{N}*=|,)?([\\+\\*\\-\\?\\p{L}\\p{N}\\-_\\.@\\$%/#@\\^:]*)(\\(?)";
var x = n.analyzeString("add(1,1)",r);
console.log(a.select(x,"fn:match",fn.string))
