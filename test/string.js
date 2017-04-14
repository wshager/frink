const n = require("../lib/string");
const assert = require("assert");
const t = require("../lib/transducers");

function assertEq(a,b){
	assert.equal(JSON.stringify(a),JSON.stringify(b));
}

var x = n.analyzeString("+",/(\)[\+\*\-\?]?)|(=#\p{N}+#?\p{N}*=|,)?([\+\*\-\?\p{L}\p{N}\-_\.@\$%/#@\^:]*)(\(?)/);

console.log(x.toString())
