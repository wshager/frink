const n = require("../lib/seq");
const shared = require("./shared");
const op = require("../lib/op");
const t = require("../lib/typed");
const rx = require("rxjs");
const xo = require("rxjs/operators");
const bv = require("../lib/boolean/value");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;
//let s = n.seq(1,2,3);


//assertEq(n.head(s), n.seq(1));
//assertEq(n.tail(s), n.seq(2,3));
//assertEq("insertBefore",n.insertBefore(s,2,5), n.seq(1,5,2,3));
//assertEq(n.reverse(s), n.seq(3,2,1));
//assertEq(n.filter(s,_ => _ > 1),n.seq(2,3));
//assertEq(n.forEach(s,_ => _ + 1),n.seq(2,3,4));
//assertEq(n.foldLeft(s,1,(a,_) => a + _),n.seq(7));

//assertThrows("exactlyOne",$ => n.exactlyOne(s));
//assertThrows("zeroOrOne",$ => n.zeroOrOne(s));

//console.log("All tests passed");
var $a = n.seq(3);
var $b = n.range(5,1);
//var ret = n.geq($a,$b);
const add = t.def("add",[t.maybe(Number),t.maybe(Number)],t.maybe(Number))(op.add);

n.foldLeft($b,0,add).subscribe(console.log);

//rx.pipe(xo.mergeMap(x => xo.pairwise()(n.seq(bv.boolean(fn(x)),x))),rxFilter(([t]) => t),map(([,x]) => x))
//rx.pipe(xo.switchMap(a => xo.map(b => op.eq(a,b))($b)),xo.first(x => x,false))($a).subscribe(console.log);
n.seq(op.geq(1,1)).subscribe(console.log);
