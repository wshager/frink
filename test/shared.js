const assert = require("assert");
const n = require("../lib/index");

require("rxjs/add/operator/zip");

exports.assertEq = function assertEq(name,$a,$b){
	$a.zip(n.seq($b)).subscribe(ab => {
		const [a,b] = ab;
		assert.equal(JSON.stringify(a),JSON.stringify(b));
		console.log("testing",name,":",a,"equals",b);
	});
}

exports.assertThrows = function assertThrows(name,f){
	assert.throws(() => {
		f().subscribe({
			error:err => {
				console.log("testing",name,": throws",err.toString());
				throw new Error(err);
			}
		})
	});
}
