const fs = require("fs");
const WebSocket = require('ws');
const microtime = require("microtime");

const xvptree = require("../lib/index");

var xml = fs.readFileSync(__dirname+"/test.xml",'utf-8',function(err){
    if(err) throw new Error(err);
});

var html = `<html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <p>dit is een alinea</p>
        <p>dit is nog een alinea</p>
        <p>dit is nog een alinea</p>
    </body>
</html>`;
var e,s = microtime.now();
xvptree.parseString(xml,function(err,out){
	if(err) console.error(err);
    e = microtime.now();
    console.log((e - s)/1000);
    var str = "";
    var x;
    s = microtime.now();
    var iter = xvptree.docIter(out);
    for(let n of iter) {
        if(n.type==17) console.log("closing ",n.vnode._name); else console.log("node:",n.name);
    }
    //console.log(out.toString())
    //console.log((microtime.now() - s)/1000);
    return;
    //return;
    //console.log(out.toString())
    //var root = iter.next().value;
    s = microtime.now();
    //var c = xvptree.firstChild(root);
    //var d = xvptree.childrenByName(root,"body");
    e = microtime.now();
//    console.log(d.toString());
    console.log((e - s)/1000);
    //var elm = xvptree.elem("test",[xvptree.text("text")]);
    //d = xvptree.appendChild(d.get(0),elm);
    //console.log(d.toString());
    s = microtime.now();
    var l3 = xvptree.toL3(out);
    e = microtime.now();
    console.log((e - s)/1000);
    console.log(l3);
    s = microtime.now();
    var ret = xvptree.fromL3(l3);
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
  });
});
    //console.log(node.type == 17 ? "closing "+node.vnode.name : node.nameOrValue);
    //console.log(out.get("html").get("body").toString())
    //console.log(out.get("html").getByIndex(1).toString())

    //console.log(xvptree.stringify(out))
    //console.log(out.toString())
    //console.log(c._parent.toString());
    //var b = xvptree.firstChild(out2);
    //b = xvptree.nextSibling(b);

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
