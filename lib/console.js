var n = require("./index");
function log(...a) {
	function getErrorObject(){
		try { throw Error(""); } catch(err) { return err; }
	}

	var err = getErrorObject();
	var caller_line = err.stack.split("\n")[4];
	var index = caller_line.indexOf("at ");
	var clean = caller_line.slice(index+2, caller_line.length);
	n.from(a.map(x => n.fromL3(n.serialize(x),NaN).filter(x => x.depth < 2 && x.type < 17))).concatAll().toArray().subscribe(arr => {
		arr = arr.map(x => JSON.stringify(x.toJS()));
		arr.unshift(clean);
		console.log.apply(console,arr);
	});
	//n.from(a.map(x => n.serialize(x))).concatAll().toArray().subscribe(x => console.log(JSON.stringify(x)))
	return n.seq();
}

module.exports.log = log;

module.exports.error = function(...a) {
	return log.apply(this,a);
};
