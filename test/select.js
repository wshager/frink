const n = require("../lib/index");
//const microtime = require("microtime");
const microtime = {
    now:function(){
        return (new Date()).getTime() * 1000;
    }
}

var s = microtime.now();
handle(n.parse(`<persoon id="243">
<naam>
  <voornaam>Wouter</voornaam>
  <achternaam>Hager</achternaam>
 </naam>
  <beroep>programmeur</beroep>
  <!-- comment -->
  test
</persoon>`));

function handle(out){
	var s = n.select(out,"@*",n.string);
	console.log("s",s)
}
