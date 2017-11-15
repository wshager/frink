const assert = require("assert");
const n = require("../lib/index");

require("rxjs/add/operator/zip");

exports.assertEq = function assertEq(name,$a,$b){
	n.seq($a).zip(n.seq($b)).subscribe(ab => {
		let [a,b] = ab;
		a = JSON.stringify(a);
		b = JSON.stringify(b);
		assert.equal(a,b,`Error in test ${name}, expected ${b} got ${a}`);
		console.log("testing",name,":",a,"equals",b);
	});
};

exports.assertThrows = function assertThrows(name,f){
	assert.throws(() => {
		f().subscribe({
			error:err => {
				console.log("testing",name,": throws",err.toString());
				throw new Error(err);
			}
		});
	});
};
