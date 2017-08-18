const n = require("../lib/index");
const microtime = require("microtime");

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
	var ret = n.select(out,"@test");
	console.log((microtime.now() - s)/1000);
	console.log("ret",ret);
}
