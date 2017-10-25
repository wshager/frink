const n = require("../lib/index");
const type = require("../lib/type");
const assert = require("assert");

function assertEq($a,$b){
	$a.subscribe(a => {
		$b.subscribe(b => {
			assert.equal(JSON.stringify(a),JSON.stringify(b));
		});
	});
}

assertEq(type.op(n.seq("test"),"eq",n.seq("test")),n.seq(true));

//assertEq(type.op(n.seq("test","test2"),"=",n.seq("test")),n.seq(true));

console.log("All tests passed");

type.op(n.seq("test","test2"),"=",n.seq("test")).subscribe(console.log);
