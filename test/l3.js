var n = require("../lib/index");
//const raddle = require("../lib/raddle");
var array = require("../lib/array");
//var fetch = require("node-fetch");
var beautify = require("js-beautify").js;
var fs = require("fs");
//var console = require("../lib/console");
//config.$ = $;
//n.seq().subscribe(console.log);
//14,"if",12,"1",15,12,"1",17,15,14,"$",3,"x",12,"0",17,14,"$",3,"x",12,"1",17,14,"$",3,"x",17,17,17
//const json = n.from();
var query = `
$(local:add,function(),{add($(1),$(2))});

local:add(1,2)
`;
var file = "compat";
var now = process.hrtime();
var path = "../raddled/fn.rdl";
//var p = n.parseL3(path);
var p = n.parseRdlString(query);
//p.filter((x,i) => i > 2580 && i < 2590).subscribe(x => console.log(x.name || x.value));
n.toJS(p)
	.map(text => beautify(text, { indent_with_tabs: true, space_in_empty_paren: false }))
	.map(text => {
		fs.writeFile(`./lib/${file}.js`, text, function(err) {
			if(err) return console.log(err);
			//console.log(JSON.stringify(ret));
			console.log("file was saved");
		});
		try {
			return eval(text);
		} catch(err) {
			console.error("Error occurred",err);
			//return n.seq();
		}
	})
	.subscribe({
		next:x => {
			console.log((x));
		},
		complete:()=> {
			var end = process.hrtime(now);
			//console.log(JSON.stringify(ret));
			console.log("compiled in",end[0]+"."+end[1]);
		},
		error: err => console.error(err)
	});

/*fs.readFile(`../raddle.xq/lib/${file}.xql`, "utf8", (err,ret) => {
	if(err) return console.log(err);
	const query = ret.toString();
	fetch("http://127.0.0.1:8080/exist/apps/raddle.xq/tests/eval.xql?transpile=l3",{
		method:"POST",
		headers:{
			"Accept": "application/json,text/plain",
			"Content-Type": "text/plain"
		},
		body:query
	})
		.then(r => {
			return r.json();
		})
		.catch(err => {
			console.error("Error occurred",err);
		})
		.then(ret => {
			var end = process.hrtime(now);
			//console.log(JSON.stringify(ret));
			console.log("parsed in",end[0]+"."+end[1]);
			now = process.hrtime();
			n.toJS(n.fromL3Stream(n.from(ret), NaN))
				.map(text => beautify(text, { indent_with_tabs: true, space_in_empty_paren: false }))
				.map(text => {
					fs.writeFile(`./lib/${file}.js`, text, function(err) {
						if(err) return console.log(err);
						//console.log(JSON.stringify(ret));
						console.log("file was saved");
					});
					try {
						return eval(text);
					} catch(err) {
						console.error("Error occurred",err);
						//return n.seq();
					}
				})
				.subscribe({
					next:x => {
						console.log((x));
					},
					complete:()=> {
						var end = process.hrtime(now);
						//console.log(JSON.stringify(ret));
						console.log("compiled in",end[0]+"."+end[1]);
					},
					error: err => console.error(err)
				});
		});
});
*/
