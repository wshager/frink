const n = require("../lib/index");
const validate = require("../lib/validate");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

validate.validate({"a":1},{
	type:"object",properties:{
		a:{type:"number"}
	}
}).subscribe(console.log);
