const array = require("../lib/array");
const assert = require("assert");
const t = require("../lib/transducers");
const s = require("../lib/seq");
const n = require("../lib/type");

function assertEq(a,b){
	assert.equal(JSON.stringify(a),JSON.stringify(b));
}

var x = array.default("a","b","c");

assertEq(array.get(x,1),"a");
assertEq(array.append(x,"d").toJS(),["a","b","c","d"]);
assertEq(array.insertBefore(x,2,"d").toJS(),["a","d","b","c"]);
assertEq(array.remove(x,2).toJS(),["a","c"]);
assertEq(array.size(x),3);
assertEq(array.tail(x).toJS(),["b","c"]);
assertEq(array.head(x).toJS(),["a"]);
assertEq(array.subarray(x,2).toJS(),["b","c"]);
assertEq(array.subarray(x,2,array.size(x) + 2 - 1).toJS(),["b","c"]);
assertEq(array.subarray(x,2,1).toJS(),["b"]);


console.log("all tests passed");

console.log(t.foldLeft(x,"",(a,b) => a + b));
console.log(t.transform(x,t.compose(t.filter(_ => _ != "a"),t.forEach(_ => _ + ".ok"))));

console.log(array.default(n.string("a"),s.seq()));
