const Observable = require("rxjs/Observable").Observable;
require("rxjs/add/observable/empty");
require("rxjs/add/observable/from");
require("rxjs/add/observable/of");
require("rxjs/add/operator/concat");
require("rxjs/add/operator/scan");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/map");
require("rxjs/add/operator/mergeMap");
require("rxjs/add/operator/first");

const from = require("rxjs/observable/from").from;
const raddle = require("../lib/raddle");
const l3 = require("../lib/l3");
const q = `
$<(test,"test/test.rdl");

test:test(2,3)
`;
const s = process.hrtime();
//l3.fromL3Stream(
raddle.parse("test/test.rdl")
//).subscribe(x => console.log(x.type == 17 ? "close "+(x.node.name || "quot") : x.type == 15 ? "quot" : x.name || x.value));
	.subscribe({
		next(x) {
			console.log(x);
		},
		complete(){
			console.log(process.hrtime(s)[1] / 1e6);
		}
	});
