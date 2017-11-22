const n = require("../lib/index");
//const microtime = require("microtime");
const microtime = {
	now:function(){
		return (new Date()).getTime() * 1000;
	}
};

var s = microtime.now();
n.parse(`<persoon id="243">
  <voornaam>Wouter</voornaam>
  <achternaam>Hager</achternaam>
  <beroep>programmeur</beroep>
</persoon>`).subscribe(handle);
function handle(out){
	var e = microtime.now();

	console.log("parsed",(e - s)/1000);
	console.log(out);
	n.vdoc(out).subscribe(x => {
		console.log(x.type,x.name,x.depth);
	});

	var elem = n.e("hobbies",[n.x("muziek")]);

	s = microtime.now();
	var root = n.firstChild(out);
	let next = n.insertChildBefore(n.lastChild(root),elem);
	next.subscribe({
		next:x => console.log(x + ""),
		complete:() => console.log("appendChild",(microtime.now() - s)/1000)
	});
	s = microtime.now();
	n.select(out,"*").subscribe({
		next:x => console.log(x + ""),
		complete:() => console.log("appendChild",(microtime.now() - s)/1000)
	});
	return;

	s = microtime.now();
	var l3 = n.toL3(out);
	e = microtime.now();
	console.log("toL3",(e - s)/1000);
	var test = n.fromL3(l3);
	console.log(n.firstChild(test)+"");
	s = microtime.now();
	var js = n.toJS(out);
	e = microtime.now();
	console.log("toJS", (e - s)/1000, JSON.stringify(js));

}
