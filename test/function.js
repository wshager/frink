const n = require("../lib/index");
const a = require("../lib/array");
const fn = require("../lib/function");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

const toObj = $m => $m.reduce((a,m) => {
	for(var kv of m.entries()) {
		a[kv[0]] = kv[1];
	}
	return a;
},{});

assertEq("apply",n.apply((x,y) => x + y, a.default(1,2)),3);
assertEq("sort",n.sort(n.seq(3,2,1)),n.seq(1,2,3));
assertEq("loadModule",toObj(n.loadModule("http://www.w3.org/2005/xpath-functions")),fn);
console.log("all tests passed");
