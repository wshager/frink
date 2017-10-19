const n = require("../lib/index");
const microtime = require("microtime");
const Rx = require("rxjs");
//const l3 = require("l3-model");
handle(n.parse(`<persoon id="243" test="test">
<naam>
  <voornaam>Wouter</voornaam>
  <achternaam>Hager</achternaam>
 </naam>
  <beroep>programmeur</beroep>
  <!-- comment -->
  test
</persoon>`));

function handle(out){
	var s = microtime.now();
	var ret = n.select(out,n.element("*"));
	console.log((microtime.now() - s)/1000);
	Rx.Observable.from(ret.iterable).subscribe(x => console.log(x+""));
}
