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

    console.log("parsed",(e - s)/1000);
    console.log(n.firstChild(out)+"");
    for(var x of n.docIter(out)){
        console.log(x.type,x.name,x.depth);
    }

    var elem = n.e("hobbies",[n.x("muziek")]);

    s = microtime.now();
    var root = n.firstChild(out);
    let next = n.insertChildBefore(n.lastChild(root),elem);
    e = microtime.now();
    console.log(next+"");
    console.log("appendChild",(e - s)/1000);

    s = microtime.now();
    var l3 = n.toL3(out);
    e = microtime.now();
    console.log("toL3",(e - s)/1000);
    var test = n.fromL3(l3);
    console.log(n.firstChild(test)+"");

    console.log(n.toJS(out));
    
}
