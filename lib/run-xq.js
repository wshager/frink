//var fetch = require("node-fetch");
var fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const writeFile = util.promisify(fs.writeFile);

function parse(path) {
	return _seq.create(o => {
		//fs.readFile(path, "utf8", (err,ret) => {
		//if(err) return o.error(err);
		//const query = ret.toString();
		//console.log(query);
		/*fetch("http://127.0.0.1:8080/exist/apps/raddle.xq/tests/eval.xql?compat=rd&transpile=l3&path="+path,{
				method:"POST",
				headers:{
					"Accept": "application/json,text/plain",
					"Content-Type": "text/plain"
				},
				body:query
			})*/
		exec(`basex -bfile=${path} d:/workspace/raddle.xq/tests/eval.xql`,{maxBuffer: 1024 * 500})
			.then(({ stdout, stderr }) => {
				if(stderr) return console.log(stderr);
				//console.log(stdout);
				return JSON.parse(stdout);
			})
			.then(ret => {
				fromL3Stream(_seq.from(ret)).subscribe(o);
			});
		//});
	});
}

function parseString(string) {
	return _seq.create(o => {
		//fs.readFile(path, "utf8", (err,ret) => {
		//if(err) return o.error(err);
		//const query = ret.toString();
		//console.log(query);
		/*fetch("http://127.0.0.1:8080/exist/apps/raddle.xq/tests/eval.xql?compat=rd&transpile=l3&path="+path,{
				method:"POST",
				headers:{
					"Accept": "application/json,text/plain",
					"Content-Type": "text/plain"
				},
				body:query
			})*/
		var rand = Math.round(Math.random() * 10000);
		const tmp = "C:/Windows/Temp/tmp"+rand;
		writeFile(tmp,string,{encoding:"utf8"}).then(() => {
			exec(`basex -bfile=${tmp} d:/workspace/raddle.xq/tests/eval.xql`,{maxBuffer: 1024 * 500})
				.then(({ stdout, stderr }) => {
					fs.unlink(tmp,err => {
						if(err) console.log(err);
					});
					if(stderr) return console.log(stderr);
					//console.log(stdout);
					return JSON.parse(stdout);
				})
				.then(ret => {
					fromL3Stream(_seq.from(ret)).subscribe(o);
				});

		});
	});
}
