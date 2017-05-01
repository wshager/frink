const frink = require("../lib/index");
const validate = require("../lib/validate");
const microtime = require("microtime");
const iterJS = frink.iterJS;
const toL3 = frink.jsToL3;
const fromL3 = frink.jsFromL3;
const fs = require("fs");


var json = {
	"bla": [1, 2, 3],
	"check": [
		{
			"x": 9
		}
	]
};

var schema = {
	"type":"object",
	"properties":{
		"bla": {
			"type":"array",
			"items": ["number","number","number"],
			"additionalItems": false
		},
		"check": {
			"type":"array",
			"items": [{
				"type": "object",
				"properties": {
					"x":{
						"type":"number",
						"maximum": 8
					}
				}
			}]
		}
	}
};

var x = frink.fromJS(1);
frink.iter(x,_ => {
	console.log(_.name,_.type,_.value)
});

console.log(x.toString())
console.log(frink.toJS(x));

console.log(validate.validate(x,{
	"type":"number","maximum": 1}));
/*
var largeJSON = fs.readFileSync(__dirname+"/large.json",'utf-8',function(err){
    if(err) throw new Error(err);
});

var ret = [];
var s = microtime.now();
var jsdoc = JSON.parse(largeJSON);
var e = microtime.now();
console.log("native parse",(e-s)/1000);

s = microtime.now();
var l3 = toL3(jsdoc);
e = microtime.now();

console.log("toL3",(e-s)/1000);

//console.log(l32)
s = microtime.now();
var out = fromL3(l3);
e = microtime.now();

console.log("jsFromL3",(e-s)/1000);

console.log(JSON.stringify(out) === JSON.stringify(jsdoc));

s = microtime.now();
var out2 = frink.fromL3(l3);
e = microtime.now();

console.log("fromL3",(e-s)/1000);

fs.writeFile(__dirname+"/out.json",JSON.stringify(out));
//console.log(frink.fromL3(l3).toString());
fs.writeFile(__dirname+"/out.l3",Buffer.from(l3).toString());

const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:8081');

ws.on('open', function open() {
  ws.send(JSON.stringify({
      type: 'handshake',
    port: 8081,
    host: '127.0.0.1'
  }),function(res){
    console.log("has shaked",res);
    ws.send(FastIntCompression.compress(l3));
    ws.close();
  });
});
*/
