const fs = require("fs");
const WebSocket = require('ws');
const microtime = require("microtime");
const FastIntCompression = require("fastintcompression");
const n = require("../lib/index");
const t = require("transducers.js");

var xml = fs.readFileSync(__dirname+"/test.xml",'utf-8',function(err){
    if(err) throw new Error(err);
});

var html = fs.readFileSync(__dirname+"/test.html",'utf-8',function(err){
    if(err) throw new Error(err);
});

var seq = n.seq(1,2,3,4);
var f = n.transform(seq,n.compose(n.drop(2),n.take(2)));
console.log(n.insertBefore(seq,2,n.seq(8,9)),f)
//console.log(f,n.foldLeft(seq,(a,v) => a && n.geq(v,3),true));
for(let x of t.seq(seq,t.compose(t.drop(2),t.take(2)))) console.log(x);

var m = n.l(n.seq(n.e("test",1),n.x(false),n.x("x","bla")));
console.log(m.toString());
var tokens = n.tokenize("abc","");
console.log(n.eq(n.stringJoin(tokens,","),"a,b,c"));
console.log(n.eq(tokens,"c"));
//html = `<root class="root"><a id="test">1</a><b>2</b><a id="test2">4</a><b>5</b></root>`;

var e,s = microtime.now();
//n.parse(`<article-title>Viewpoint: Consultation time&#x2014;time for a change? Still the &#x201C;perfunctory work of perfunctory men!&#x201D;</article-title>`)
//handle(null,n.doc(__dirname+"/test.xml"));

test(n.parse(`<persoon id="243">
  <voornaam>Wouter</voornaam>
  <achternaam>Hager</achternaam>
  <beroep>programmeur</beroep>
</persoon>`));

function test(out){
    fs.writeFileSync(__dirname+"/persoon.l3",Buffer.from(FastIntCompression.compress(n.toL3(out))));
}

function handle(err,out){
	if(err) console.error(err);
    //console.log(out+"");
    e = microtime.now();
    console.log("parsed",(e - s)/1000);
    var str = "";
    s = microtime.now();

    var x = n.firstChild(out);
    var y = n.select(x,n.element("div"),n.element("div"),n.attribute("class"),n.filter(_ => {
        return n.op(n.data(_),"eq", "container");
    }));
    console.log(y+"");
    e = microtime.now();
    //console.log(x+"")
    console.log("select",(e - s)/1000);
    //var iter = n.docIter(out);
    var arr = [];
    s = microtime.now();
    n.iter(out,function(n){
        arr.push(n);
        //if(n.type==17) console.log("closing ",n.inode._name); else console.log("node:",n.name,n.value, n.inode && n.inode._attrs ? n.inode._attrs.fold((z,x) => z += x,"") : "");
    });
    e = microtime.now();
    console.log("iter",(e - s)/1000);

    s = microtime.now();
    str = out.toString();
    e = microtime.now();
    console.log("tostr",(e - s)/1000);
    s = microtime.now();
    str = n.stringify(out);
    e = microtime.now();
    console.log("frinkify",(e - s)/1000);
    var elem = n.e("h4",[n.x("NEW TEXT")]);
    s = microtime.now();
    let next = n.insertBefore(n.nextSibling(n.firstChild(x)),elem);
    e = microtime.now();
    //console.log(next+"")
    console.log("appendChild",(e - s)/1000);
    var c = n.firstChild(x);
    s = microtime.now();
    var root = n.removeChild(x, c);
    e = microtime.now();
    console.log("removeChild",(e - s)/1000);
    //var d = n.childrenByName(c,"journal-meta");
    //e = microtime.now();
    //console.log("c",(e - s)/1000);
    var elm = n.e(n.q("http://root.org","root:p"),[n.a("id","test"),n.x("text")]);
    var d = n.appendChild(root,elm);
    console.log(d.toString());
    //  return;
    s = microtime.now();
    //console.log(out)
    var l3 = n.toL3(out);
    e = microtime.now();
    console.log("toL3",(e - s)/1000);
    console.log(l3.byteLength);
    s = microtime.now();
    var ret = n.fromL3(l3);
    e = microtime.now();
    //console.log(ret.toString());
    console.log("fromL3",(e - s)/1000);


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
//n.parseString(html,);
    //console.log(node.type == 17 ? "closing "+node.vnode.name : node.nameOrValue);
    //console.log(out.get("html").get("body").toString())
    //console.log(out.get("html").getByIndex(1).toString())

    //console.log(n.stringify(out))
    //console.log(out.toString())
    //console.log(c._parent.toString());
    //var b = n.firstChild(out2);
    //b = n.nextSibling(b);

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
}
