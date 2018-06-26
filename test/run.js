const n = require("../lib/index");

const query = `
$(local:x,1);
$(local:x)
`;
console.log("start");
const s = process.hrtime();
var p = n.parseRdlString(query);
n.run(p,{modules:{
	n:n,
	local:{}
}}).concatAll().subscribe({
	next(x) {
		console.log("x",x);
	},
	complete() {
		console.log(process.hrtime(s)[1] / 1e6);
	}
});
