var n = require("./index");
function log(...a) {
	n.fromL3(n.serialize(n.from(a.map(x => n.seq(x))).concatAll())).toArray().subscribe(arr => {
		console.log(arr.map(node => {
			return JSON.stringify(node.type == 5 ? node.inode.$children : node.inode);
		}).join(" "));
	});
	return n.seq();
}

module.exports.log = log;

module.exports.error = function(...a) {
	return log.apply(this,a);
};
