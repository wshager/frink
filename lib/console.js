var n = require("./index");
function log(...a) {
	n.serialize(n.from(a.map(x => n.seq(x))).concatAll()).toArray().subscribe(arr => {
		console.log(arr);
	});
	return n.seq();
}

module.exports.log = log;

module.exports.error = function(...a) {
	return log.apply(this,a);
};
