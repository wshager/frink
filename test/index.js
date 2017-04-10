const n = require("../lib/index");
const microtime = require("microtime");

var s = microtime.now();
handle(n.parse(`<persoon id="243">
  <voornaam>Wouter</voornaam>
  <achternaam>Hager</achternaam>
  <beroep>programmeur</beroep>
</persoon>`));

function handle(out){
    var e = microtime.now();
    if(err) console.error(err);
    console.log(out+"");
    console.log("parsed",(e - s)/1000);   
    var elem = n.e("hobbies",[n.x("muziek")]);
    
    s = microtime.now();
    let next = n.insertBefore(out,elem);
    e = microtime.now();
    console.log(next+"")
    console.log("appendChild",(e - s)/1000);
    
    s = microtime.now();
    var l3 = n.toL3(out);
    e = microtime.now();
    console.log("toL3",(e - s)/1000);
    console.log(l3.byteLength);
}
