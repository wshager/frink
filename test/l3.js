var n = require("../lib/index");
var array = require("../lib/array");
var fetch = require("node-fetch");
var beautify = require("js-beautify").js;
var fs = require("fs");

//config.$ = $;
//n.seq().subscribe(console.log);
//14,"if",12,"1",15,12,"1",17,15,14,"$",3,"x",12,"0",17,14,"$",3,"x",12,"1",17,14,"$",3,"x",17,17,17
//const json = n.from();
var query = `
xquery version "3.1";

module namespace xqc="http://raddle.org/xquery-compat";

declare function xqc:test($a,$x) {
	let $x :=
		if($a eq 2) then 1 else $x
	return $x
};

declare function xqc:test2($a,$x) {
	let $x :=
		if($a eq 2) then 1 else $x
	return $x
};

`;
var file = "xq-compat-b";
var def = "const n = require(\"../lib/index\"), array = require(\"../lib/array\"), map = require(\"../lib/map\");\n";
var now = new Date().getTime();
fs.readFile(`../raddle.xq/lib/${file}.xql`, "utf8", (err,ret) => {
	if(err) return console.log(err);
	const query = ret.toString();
	fetch("http://127.0.0.1:8080/exist/apps/raddle.xq/tests/eval.xql?transpile=l3",{
		method:"POST",
		headers:{
			"Accept": "application/json,text/plain, */*",
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
			var end = new Date().getTime();
			console.log("done",(end-now)/1000);
			n.toJS(n.fromL3Stream(n.from(ret), NaN))
				.map(x => {
					//console.log(x.text);
					let text = def+x.text;
					if(x.isModule) {
					// interop
						const prefix = x.modulePrefix;
						for(const k in x.module) {
							const ars = x.module[k];
							text += prefix + "." + k + " = (...$) => {\n";
							text += "const $len = $.length;";
							for(var arity of ars) {
								text += `if(process.env.debug) console.log("${prefix}.${k}",$len);\n`;
								text += `if($len == ${arity}) return n.fromPromise(${prefix}.${k}$${arity}.apply(null,$));\n`;
							}
							text += "};";
						}
						text += "module.exports = " + prefix;
					}
					fs.writeFile(`./lib/${file}.js`, beautify(text, { indent_with_tabs: true, space_in_empty_paren: false }), function(err) {
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
				.subscribe({next:x => console.log(x),error: err => console.error(err)});
		});
});
