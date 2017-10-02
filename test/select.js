const n = require("../lib/index");
const Rx = require("rxjs/Rx");
const microtime = require("microtime");
const l3 = require("l3-model");
handle(n.parse(`<persoon id="243" test="test">
<naam>
  <voornaam>Wouter</voornaam>
  <achternaam>Hager</achternaam>
 </naam>
  <beroep>programmeur</beroep>
  <!-- comment -->
  test
</persoon>`));

function lift(source,operator) {
	const observable = new Rx.Observable();
	observable.source = source;
	observable.operator = operator;
	return observable;
}
function handle(out){
	var s = microtime.now();
	var ret = n.select(out,n.child(n.element("*")));
	console.log((microtime.now() - s)/1000);
	lift(Rx.Observable.from(ret.iterable),new n.MergeMapOperator(l3.toL3)).subscribe(console.log);
}
