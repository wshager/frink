var n = require("../lib/index");
var map = require("../lib/map");
var array = require("../lib/array");
var a = require("../lib/array-util");
const xqc = require("../lib/xq-compat-b.js");
const console = require("../lib/console");
//const Scheduler = require("rxjs/Scheduler").Scheduler;

var x = xqc.analyzeChars(n.from(`
	xquery version "3.1";

	module namespace a="http://raddle.org/array-util";
	(:import module namespace console="http://exist-db.org/xquery/console";:)

	declare function a:put($array as array(*),$position,$member) {
	    if($position gt array:size($array)) then
	        array:append($array,$member)
	    else
	    	array:insert-before(array:remove($array, $position),$position,$member)
	};

	declare function a:fold-left($array as array(*),$zero,$function){
	    a:fold-left($array,$zero,$function,array:size($array))
	};

	declare function a:fold-left($array as array(*),$zero,$function, $s){
		if($s eq 0) then
			$zero
		else
			a:fold-left(array:tail($array), $function($zero, array:head($array)), $function, $s - 1)
	};

	declare function a:fold-left-at($array as array(*),$zero,$function) {
		a:fold-left-at($array,$zero,$function,1)
	};

	declare function a:fold-left-at($array as array(*),$zero,$function,$at) {
		a:fold-left-at($array,$zero,$function,$at,array:size($array))
	};

	declare function a:fold-left-at($array as array(*),$zero,$function,$at,$s){
		if($s eq 0) then
			$zero
		else
			a:fold-left-at(array:tail($array), $function($zero, array:head($array), $at), $function, $at + 1, $s - 1)
	};


	declare function a:reduce-around-at($array,$function) {
	    let $head := array:head($array)
		return a:reduce-around-at(array:tail($array),$function,$head,$head,(),2)
	};


	declare function a:reduce-around-at($array,$function,$zero) {
		a:reduce-around-at($array,$function,$zero,())
	};


	declare function a:reduce-around-at($array,$function,$zero,$last-seed) {
		a:reduce-around-at($array,$function,$zero,$last-seed,())
	};


	declare function a:reduce-around-at($array,$function,$zero,$last-seed,$next-seed) {
		a:reduce-around-at($array,$function,$zero,$last-seed,$next-seed,1)
	};

	declare function a:reduce-around-at($array as array(*),$function,$zero,$last-seed,$next-seed,$at) {
	    let $tmp := map {
	        "out":$zero,
	        "last":$last-seed,
	        "entry":array:head($array),
	        "at":$at
		}
		let $tmp := a:fold-left(array:tail($array),$tmp,function($tmp,$next){
		    let $out := $function($tmp("out"),$tmp("entry"),$tmp("last"),$next,$tmp("at"))
		    let $tmp := map:put($tmp,"out",$out)
		    let $tmp := map:put($tmp,"last",$tmp("entry"))
		    let $tmp := map:put($tmp,"entry",$next)
		    return map:put($tmp,"at",$at + 1)
		})
		return $function($tmp("out"),$tmp("entry"),$tmp("last"),$next-seed,$tmp("at"))
	};

	declare function a:reduce-ahead-at($array as array(*),$function) {
		a:reduce-ahead-at(array:tail($array),$function,array:head($array),(),2)
	};


	declare function a:reduce-ahead-at($array as array(*),$function,$zero) {
		a:reduce-ahead-at($array,$function,$zero,())
	};


	declare function a:reduce-ahead-at($array as array(*),$function,$zero,$next-seed) {
		a:reduce-ahead-at($array,$function,$zero,$next-seed,1)
	};

	declare function a:reduce-ahead-at($array as array(*),$function,$zero,$next-seed,$at) {
	    let $tmp := map {
	        "out":$zero,
	        "entry":array:head($array),
	        "at":$at
		}
		let $tmp := a:fold-left(array:tail($array),$tmp,function($tmp,$next){
		    let $out := $function($tmp("out"),$tmp("entry"),$next,$tmp("at"))
		    let $tmp := map:put($tmp,"out",$out)
		    let $tmp := map:put($tmp,"entry",$next)
		    return map:put($tmp,"at",$at + 1)
		})
		return $function($tmp("out"),$tmp("entry"),$next-seed,$tmp("at"))
	};

	declare function a:fold-right($array as array(*),$zero,$function){
	    a:fold-right($array, $zero, $function, array:size($array))
	};

	declare function a:fold-right($array as array(*),$zero,$function,$s){
		if($s eq 0) then
			$zero
		else
		    a:fold-right(array:remove($array,$s), $function($zero,array:get($array,$s)), $function, $s - 1)
	};

	declare function a:fold-right-at($array as array(*),$zero,$function) {
		a:fold-right-at($array,$zero,$function,array:size($array))
	};

	declare function a:fold-right-at($array as array(*),$zero,$function,$at){
		if($at eq 0) then
			$zero
		else
		    a:fold-right-at(array:remove($array,$at), $function($zero, array:get($array,$at), $at), $function, $at - 1)
	};

	declare function a:for-each($array as array(*),$function){
		a:for-each($array,$function,[])
	};

	declare function a:for-each($array as array(*),$function,$ret){
		if(array:size($array) eq 0) then
			$ret
		else
			a:for-each(array:tail($array), $function, array:append($ret,$function(array:head($array))))
	};

	declare function a:for-each-at($array as array(*),$function){
		a:for-each-at($array,$function,[],1)
	};

	declare function a:for-each-at($array as array(*),$function,$ret,$at){
		if(array:size($array) eq 0) then
			$ret
		else
			a:for-each-at(array:tail($array), $function, array:append($ret,$function(array:head($array), $at)), $at + 1)
	};

	declare function a:last($array as array(*)) {
	    array:get($array,array:size($array))
	};

	declare function a:pop($array as array(*)) {
	    array:remove($array,array:size($array))
	};

	declare function a:first-index-of($array as array(*),$lookup as item()?) {
	    a:fold-left-at($array,(),function($pre,$cur,$at) {
	        if(empty($pre) or deep-equal($cur, $lookup)) then
	            $at
	        else
	            $pre
	    })
	};

	declare function a:last-index-of($array as array(*),$lookup as item()?) {
	    a:fold-right-at($array,0,function($cur,$pre,$at) {
	        if($pre eq 0 and deep-equal($cur, $lookup)) then
	            $at
	        else
	            $pre
	    })
	};


`),map.map({"$compat":"xquery","$transpile":"l3"}));
//console.log(n.toJS(n.fromL3Stream(x, NaN)));
console.log(x);

async function _t(...$) {
	$ = n.frame($);
	return $("flags", $(1)),
	$("char", $(2)),
	$("oldType", $("flags").call($, "type")),
	$("buffer", $("flags").call($, "buffer")),
	//console.log("flags",$("flags")),
	$("buffer",
		(await n.when(n.and($("zero"), $("flag"))) ?
			$("buffer") :
			(
				n.seq($("buffer"), $("char"))
			)
		)),
	console.log("buffer1",$("buffer")),
	$("flags", map.put($("flags"), "buffer", $("buffer"))),
	console.log("flags",$("flags")),
	$("flags");
}

function t(x,s) {
	return n.fromPromise(_t(x,s));
}
async function _a() {
	var $ = n.frame();
	console.log("A called");
	$("r",array.array(map.map({t:1,d:1,v:1})));
	$("tpl",map.map({t:2,d:2,v:2}));
	$("r", await n.when(n.exists($("tpl")),"exists-tpl") ?
		array.append($("r"), $("tpl")) :
		$("r"));
	return $("r");
}

async function _b() {
	var $ = n.frame();
	$("r",n.fromPromise(_a(),"A"));
	$("size",array.size($("r")));
	return await n.when(n.gt($("size"),1)) ?
		(console.log("true-size-0"),$("last", $("r").call("size", $("size"))),
		//console.log("GG-LAST",$("last")),
		await n.when(n.empty($("last"))) ?
			(console.log("true-empty-last"),map.map()) :
			(console.log("false-empty-last"),await n.when(n.eq($("last").call("t", "t"), 9)) ?
				(console.log("true-last-t-9"),n.seq()) :
				(console.log("false-last-t-9"),$("last")))) :
		(console.log("false-size-0"),map.map());
}

/*
$("flags", map.map({
	"char":"t",
	"type": 0,
	"zero": false,
	"buffer":n.seq("a","b"),
	"flag":n.seq()
}))
$("flags", t($("flags"),"e"))
$("flags", t($("flags"),"s"))
$("flags", t($("flags"),"t"))
$("flags").subscribe(console.log);
*/
