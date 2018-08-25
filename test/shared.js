const assert = require("assert");
const n = require("../lib/index");

const zip = require("rxjs/operators").zip;

exports.assertEq = function assertEq(name,$a,$b){
	zip(n.seq($b))(n.seq($a)).subscribe(([a,b]) => {
		a = a.toJS ? a.toJS() : a;
		b = b.toJS ? b.toJS() : b;
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
