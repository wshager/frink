const Rx = require("rxjs");
const n = require("../lib/index");
const array = require("../lib/array");
const a = require("../lib/array-util");
n.serialize(Rx.Observable.empty()).subscribe({
	next: function(x) { console.log(x); },
	error: function(err) {console.error(err); },
	complete: function() { console.log("complete"); }
});
