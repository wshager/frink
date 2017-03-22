const fs = require("fs");
const WebSocket = require('ws');
const microtime = require("microtime");

const frink = require("../lib/index");

var xml = fs.readFileSync(__dirname+"/test.xml",'utf-8',function(err){
    if(err) throw new Error(err);
});

var html = fs.readFileSync(__dirname+"/test.html",'utf-8',function(err){
    if(err) throw new Error(err);
});


var e,s = microtime.now();
frink.parseString(html,function(err,out){
	if(err) console.error(err);
    e = microtime.now();
    console.log((e - s)/1000);
    var str = "";
    var x;
    //var iter = frink.docIter(out);
    frink.iter(out,function(n){
        //if(n.type==17) console.log("closing ",n.inode._name); else console.log("node:",n.name,n.value, n.inode && n.inode._attrs ? n.inode._attrs.fold((z,x) => z += x,"") : "");
    });
    s = microtime.now();
    str = out.toString();
    e = microtime.now();
    console.log("tostr",(e - s)/1000);
    s = microtime.now();
    str = frink.stringify(out);
    e = microtime.now();
    console.log("frinkify",(e - s)/1000);
    var elem = frink.elem("div",[frink.text("NEW TEXT")]);
    s = microtime.now();
    let next = frink.insertBefore(frink.firstChild(out),elem);
    e = microtime.now();
    console.log("appendChild",(e - s)/1000);
    var c = frink.firstChild(out);
    s = microtime.now();
    var root = frink.removeChild(out, c);
    e = microtime.now();
    console.log("removeChild",(e - s)/1000);
    //var d = frink.childrenByName(c,"journal-meta");
    //e = microtime.now();
    //console.log("c",(e - s)/1000);
    var elm = frink.elem("p",[frink.text("text")]);
    //var d = frink.appendChild(root,elm);
    console.log(elm.toString());
    return;
    s = microtime.now();
    //console.log(out)
    var l3 = frink.toL3(out);
    e = microtime.now();
    console.log((e - s)/1000);
    console.log(l3);
    s = microtime.now();
    var ret = frink.fromL3(l3);
    e = microtime.now();
    //console.log(ret.toString());
    console.log((e - s)/1000);


const ws = new WebSocket('ws://127.0.0.1:8081');

ws.on('open', function open() {
  ws.send(JSON.stringify({
      type: 'handshake',
    port: 8081,
    host: '127.0.0.1'
  }),function(res){
    console.log("has shaked",res);
    ws.send(l3);
    ws.close();
  });
});
    //console.log(node.type == 17 ? "closing "+node.vnode.name : node.nameOrValue);
    //console.log(out.get("html").get("body").toString())
    //console.log(out.get("html").getByIndex(1).toString())

    //console.log(frink.stringify(out))
    //console.log(out.toString())
    //console.log(c._parent.toString());
    //var b = frink.firstChild(out2);
    //b = frink.nextSibling(b);

    //console.log(x);
	//console.log((e - s)/1000);
    //console.log(out2.toString())

	//fs.writeFile(__dirname+"/out.xml",(str));
	//console.log(str)
	//console.log((str));
	//var a = firstChild(firstChild(out),1);
	//var a1 = appendChild(a,elem("test",[text("bla")]));
	//console.log(nextSibling(nextSibling(nextSibling(firstChild(a1)))));
//	for(let c of child(a)) {
//		console.log(c);
//	}
//	console.log(firstChild(firstChild(nextSibling(a))));
//	console.log(new Date() - s);
//	parseString("<root>test</root>",function(err,out){
//		console.log(out);
//	});
});
