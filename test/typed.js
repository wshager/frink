const t = require("../lib/typed");
const s = require("../lib/seq");
// array test
// if the input is async, the data should thread through the test before it's actually used
// IOW tests should be async / observable
// even if the inner seq is invalid, we can only know once we subscribe to it
// but we don't really want to recursively handle concrete structures anyway

const toPromise = obs =>
	new Promise((resolve, reject) => {
		if(s.isSeq(obs)) {
			s.zeroOrOne(obs).subscribe({
				next: resolve,
				complete: resolve,
				error: err => {
					reject("Invalid input for toPromise: "+err);
				}
			});
		} else {
			resolve(obs);
		}
	});

const fromPromise = p => s.create(o => {
	p.then(x => {
		console.log("x",x);
		o.next(x);
		o.complete();
	}).catch(err => {
		o.error(err);
	});
});
// apply function with test (should fail):

const add = t.def("add",[t.maybe(Number),t.maybe(Number)],t.maybe(Number))((a,b) => {
	if(a === null || b === null) return null;
	return a + b;
});
const sum = t.def("sum",[t.any(Number)],t.single(Number))(a => s.foldLeft(a,0,add));
const arraySum = t.def("array-sum",[t.single(t.array(t.single(Number)))],t.single(Number))(a => {
	return a.reduce((a,x) => add(a,x),s.seq(0));
});
var addOne = t.def("add-one",[t.any(Number)],t.any(Number))(add.bind(null,1));
var map = t.def("map",[t.single(t.array(t.single(t.item))),t.single(t.def("",[t.any(t.item)],t.any(t.item),[]))],
	t.single(t.array(t.single(t.item))))((a,f) => a.map(a => f(a)));
s.seq(map(["1",2,3],addOne)).subscribe(console.log);
//arraySum(["1",2,3]).subscribe(x => console.log("x",x));
//const number = a =>
//t.single(t.array(t.single(Number)))(s.seq([s.seq(2)])).subscribe(console.log);
