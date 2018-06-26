xquery version "3.1";

module namespace xqc="http://raddle.org/xquery-compat";

import module namespace console="http://exist-db.org/xquery/console";
import module namespace a="http://raddle.org/array-util" at "../lib/array-util.xql";

declare variable $xqc:ncname := "\p{L}\p{N}\-_\.@";
declare variable $xqc:qname := "^(\p{L}|@)[" || $xqc:ncname || "]*:?" || "[" || $xqc:ncname || "]*";
declare variable $xqc:operator-regexp := "=#\p{N}+#?\p{N}*=";

declare variable $xqc:operators := map {
	1: ",",
	2.01: "some",
	2.02: "every",
	2.03: "switch",
	2.04: "typeswitch",
	2.05: "try",
	2.06: "if",
	2.07: "then",
	2.08: "else",
	2.09: "let",
	2.10: ":=",
	2.11: "return",
	2.12: "case",
	2.13: "default",
	2.14: "xquery",
	2.15: "version",
	2.16: "module",
	2.17: "declare",
	2.18: "variable",
	2.19: "import",
	(:	2.20: "at",:)
(:	2.21: "for",:)
(:	2.22: "in",:)
(:	2.23: "group by",:)
	3: "or",
	4: "and",
	5.01: "eq",
	5.02: "ne",
	5.03: "lt",
	5.04: "le",
	5.05: "gt",
	5.06: "ge",
	5.07: "=",
	5.08: "!=",
	5.09: "<=",
	5.10: ">=",
	5.11: "<<",
	5.12: ">>",
	5.13: "<",
	5.14: ">",
	5.15: "is",
	6: "||",
	7: "to",
	8.01: "+",
	8.02: "-",
	9.01: "*",
	9.02: "idiv",
	9.03: "div",
	9.04: "mod",
	10.01: "union",
	10.02: "|",
	11.01: "intersect",
	11.02: "except",
	12: "instance of",
	13: "treat as",
	14: "castable as",
	15: "cast as",
	16: "=>",
	17.01: "+",
	17.02: "-",
	18: "!",
	19.01: "/",
(:	19.02: "//",:)
(:	19.03: "/*",:)
	20.01: "[",
	20.02: "]",
	20.03: "?",
	20.04: "[",
	20.06: "{",
	20.07: "}",
	21.01: "array",
	21.02: "attribute",
	21.03: "comment",
	21.04: "document",
	21.05: "element",
	21.06: "function",
	21.07: "map",
	21.08: "namespace",
	21.09: "processing-instruction",
	21.10: "text",
	22.01: "array",
	22.02: "attribute",
	22.03: "comment",
	22.04: "document-node",
	22.05: "element",
	22.06: "empty-sequence",
	22.07: "function",
	22.08: "item",
	22.09: "map",
	22.10: "namespace-node",
	22.11: "node",
	22.12: "processing-instruction",
	22.13: "schema-attribute",
	22.14: "schema-element",
	22.15: "text",
	24: "as",
	25.01: "(:",
	25.02: ":)",
	26: ":"
};

declare variable $xqc:types := (
	"untypedAtomic",
	"dateTime",
	"dateTimeStamp",
	"date",
	"time",
	"duration",
	"yearMonthDuration",
	"dayTimeDuration",
	"float",
	"double",
	"decimal",
	"integer",
	"nonPositiveInteger",
	"negativeInteger",
	"long",
	"int",
	"short",
	"byte",
	"nonNegativeInteger",
	"unsignedLong",
	"unsignedInt",
	"unsignedShort",
	"unsignedByte",
	"positiveInteger",
	"gYearMonth",
	"gYear",
	"gMonthDay",
	"gDay",
	"gMonth",
	"string",
	"normalizedString",
	"token",
	"language",
	"NMTOKEN",
	"Name",
	"NCName",
	"ID",
	"IDREF",
	"ENTITY",
	"boolean",
	"base64Binary",
	"hexBinary",
	"anyURI",
	"QName",
	"NOTATION"
);

declare variable $xqc:operator-map := map {
	2.06: "iff",
	2.09: "item",
	5.01: "eq",
	5.02: "ne",
	5.03: "lt",
	5.04: "le",
	5.05: "gt",
	5.06: "ge",
	5.07: "geq",
	5.08: "gne",
	5.09: "gle",
	5.10: "gge",
	5.11: "precedes",
	5.12: "follows",
	5.13: "glt",
	5.14: "ggt",
	6: "concat",
	8.01: "add",
	8.02: "subtract",
	9.01: "multiply",
	10.02: "union",
	17.01: "plus",
	17.02: "minus",
	18: "for-each",
	19.01: "select",
(:	19.02: "select-deep",:)
	20.01: "filter",
	20.03: "lookup",
	20.04: "array",
	27.01: "pair"
};

declare variable $xqc:lr-op := (
	3,
	4,
	5.01,
	5.02,
	5.03,
	5.04,
	5.05,
	5.06,
	5.07,
	5.08,
	5.09,
	5.10,
	5.11,
	5.12,
	5.13,
	5.14,
	5.15,
	6,
	7,
	8.01,
	8.02,
	9.01,
	9.02,
	9.03,
	9.04,
	10.01,
	10.02,
	11.01,
	11.02,
	12,
	13,
	14,
	15,
	18,
	19.01,
	20.03,
	24
);

declare variable $xqc:fns := (
	"position","last","name","node-name","nilled","string","data","base-uri","document-uri","number","string-length","normalize-space"
);

declare function xqc:normalize-query($query as xs:string?,$params) {
	let $query := replace(replace(replace(replace($query,"%3E",">"),"%3C","<"),"%2C",","),"%3A",":")
	(: hack for suffix :)
	let $query := replace($query,"([\*\+\?])\s+([,\)\{])","$1$2")
	let $query := fold-left(map:keys($params("$operators"))[. ne 5.07 and . ne 1],$query,function($cur,$next){
		replace($cur,xqc:escape-for-regex($next,$params),if(floor($next) eq 22) then concat("$1",xqc:to-op($next,$params),"$2") else concat("$1 ",xqc:op-str($next)," $2"))
	})
	let $query := fold-left($xqc:types,$query,function($cur,$next){
		let $cur := replace($cur,concat("xs:",$next,"\s*([^\(])"),concat("core:",$next,"()$1"))
		return replace($cur,concat("xs:",$next,"\s*\("),concat("core:",$next,"("))
	})
	(: prevent = ambiguity :)
	let $query := replace($query,",","=#1=")
	let $query := replace($query,"=(#\p{N}+#?\p{N}*)=","%3D$1%3D")
	let $query := replace($query,"=","=#5#07=")
	let $query := replace($query,"%3D","=")
	let $query := replace($query,"(" || $xqc:operator-regexp || ")"," $1 ")
	let $query := replace($query,"\s+"," ")
	(: FIXME consider axes :)
	let $query := replace($query,"=#19#01=\s*=#19#01=","=#19#01= descendant::")
(:	let $query := xqc:block(analyze-string($query,"([^\s\(\),\.;]+)")/*[name(.) = fn:match or matches(string(.),"^\s*$") = false()],""):)
    let $query := for-each(tokenize($query,";"),function($cur){
        let $parts := analyze-string($cur,"([^\s\(\),\.]+)")/*[name(.) = fn:match or matches(string(.),"^\s*$") = false()]
        let $ret := xqc:block($parts,"")
        return if($ret) then replace($ret,"\s+","") else ()
    })
	(: TODO check if there are any ops left and either throw or fix :)
	return $query
};

declare function xqc:seqtype($parts,$ret,$lastseen){
	(: TODO check empty (never was an as) and complex type :)
	let $head := head($parts)/fn:group[@nr=1]/string()
	let $maybe-seqtype := if(matches($head,$xqc:operator-regexp)) then xqc:op-num($head) else 0
	return
		if($maybe-seqtype eq 20.06) then
			xqc:body($parts,concat($ret,","),array:append($lastseen,21.06))
		else
			xqc:seqtype(tail($parts),$ret,$lastseen)
};

declare function xqc:as($param,$parts,$ret,$lastseen,$subtype,$seqtype){
	let $head := head($parts)/string()
	let $next := $parts[2]/string()
	let $no :=
		if(matches($head,$xqc:operator-regexp)) then
			xqc:op-num($head)
		else
			0
	let $non :=
		if(matches($next,$xqc:operator-regexp)) then
			xqc:op-num($next)
		else
			0
(:	let $n := console:log(($head,",",$no,",",$next,",",$subtype,",",$seqtype)):)
	return
		if($no eq 20.06) then
			xqc:body($parts,concat($ret,if($subtype) then ")" else "",","),array:append($lastseen,21.06))
		else if($no eq 24) then
			(: function seq type :)
			xqc:as($param,tail($parts),concat($ret,if($subtype) then ")" else "",","),$lastseen,$subtype,true())
		else if($no eq 1) then
			if($subtype) then
				xqc:as($param,tail($parts),concat($ret,","),$lastseen,$subtype,$seqtype)
			else
				xqc:params(tail($parts),concat($ret,","))
		else if(matches($head,concat("core:[",$xqc:ncname,"]+"))) then
			if(matches($next,"^\s*\(\s*$")) then
				(: complex subtype opener :)
				xqc:as((),subsequence($parts,3),concat($ret,$head,"(",$param,",",if($head eq "core:anon") then "(" else ""),$lastseen,true(),$seqtype)
			else
				xqc:as((),tail($parts),concat($ret,$head,"(",$param,if($head eq "core:anon") then ",(" else ""),$lastseen,$subtype,$seqtype)
		else if(matches($head,"[\?\+\*]")) then
			xqc:as($param,tail($parts),concat($ret,$head),$lastseen,$subtype,$seqtype)
		else if(matches($head,"^(\(\))?\s*\)")) then
			(: TODO combine these :)
			if($subtype and $non = (1,24)) then
				xqc:as($param,tail($parts),concat($ret,if($non eq 24) then "" else ")"),$lastseen,false(),$seqtype)
			else if($non eq 24) then
				xqc:as((),tail($parts),concat($ret,if($subtype) then ")" else "","))"),$lastseen,false(),false())
			else if($non eq 20.06) then
				xqc:body(tail($parts),concat($ret,if($subtype) then ")" else "",if(matches($head,"^\(\)")) then ")" else "","),core:item(),"),array:append($lastseen,21.06))
			else
				(: what? :)
				(("what",$parts))
		else
			(: FIXME check seqtype vs subtype :)
			(: TODO add default values
			if($non eq 2.1) then
        		    xqc:body(tail($parts),concat($ret,""),($lastseen))
        		else  :)
			xqc:as($param,tail($parts),concat($ret,if($non eq 1 and $seqtype) then ")" else "",")"),$lastseen,$subtype,$seqtype)
};

declare function xqc:params($parts,$ret){
    xqc:params($parts,$ret,[])
};

declare function xqc:params($parts,$ret,$lastseen){
	let $maybe-param := head($parts)/string()
	let $rest := tail($parts)
	return
		if(matches($maybe-param,"^\(?\s*\)")) then
			if(head($rest)/string() eq "=#24=") then
				xqc:as((),$rest,concat($ret,")"),$lastseen,false(),false())
			else
				xqc:body($rest,concat($ret,"),core:item(),"),array:append($lastseen,21.06))
		else if(matches($maybe-param,"=#1=")) then
			xqc:params($rest,concat($ret,","),$lastseen)
		else if(matches($maybe-param,"^\$")) then
			if(head($rest)/string() eq "=#24=") then
				xqc:as(replace($maybe-param,"^\$","\$,"),tail($rest),$ret,$lastseen,false(),false())
			else
				xqc:params($rest,concat($ret,"core:item(",replace($maybe-param,"^\$","\$,"),")"),$lastseen)
		else
			xqc:params($rest,$ret,$lastseen)
};

declare function xqc:xfn($parts,$ret){
	(: TODO $parts(2) should be a paren, or error :)
	xqc:params(tail($parts),concat($ret, head($parts)/fn:group[@nr=1]/string(), ",(),("))
};

declare function xqc:xvar($parts,$ret){
	xqc:body(subsequence($parts,3),concat($ret,$parts[1]/string(),",(),"),[2.18])
};

declare function xqc:xns($parts,$ret){
    xqc:block(subsequence($parts,4),concat($ret, "core:namespace($,",$parts[1],",",$parts[3],")"))
};

declare function xqc:annot($parts,$ret,$annot){
	let $maybe-annot := head($parts)/fn:group[@nr=1]/string()
	let $rest := tail($parts)
	return
		if(matches($maybe-annot,"^%")) then
			xqc:annot($rest,$ret,replace($maybe-annot,"^%","-"))
		else if($maybe-annot = "namespace") then
		    xqc:xns($rest,$ret)
		else if($maybe-annot = "=#21#06=") then
			xqc:xfn($rest,concat($ret, "core:define", $annot, "($,"))
		else if($maybe-annot = "=#2#18=") then
			xqc:xvar($rest,concat($ret, "core:xvar",$annot, "($,"))
		else $ret
};

declare function xqc:xversion($parts,$ret){
	xqc:block(subsequence($parts,3),concat($ret,"core:xq-version($,",$parts[2]/string(),")"))
};

declare function xqc:xmodule($parts,$ret){
	xqc:block(subsequence($parts,5),concat($ret,"core:module($,",$parts[2]/string(),",",$parts[4]/string(),",())"))
};

declare function xqc:close($lastseen, $no as xs:integer){
    array:reverse(xqc:close($lastseen, $no, [], array:size($lastseen)))
};

declare function xqc:close($lastseen,$no as xs:integer, $ret, $s){
    if($no eq 0 or $s eq 0) then
		array:join(($ret,array:reverse($lastseen)))
	else
	    let $last := array:get($lastseen,$s)
        return
	        if($last eq 40) then
                xqc:close(array:remove($lastseen,$s),$no - 1,$ret, $s - 1)
            else
                xqc:close(array:remove($lastseen,$s),$no, array:append($ret,$last),$s - 1)
};

declare function xqc:closer($b,$c as xs:integer){
	if(array:size($b) gt 0 and a:last($b) = (2.08,2.11)) then
		xqc:closer(a:pop($b),$c + 1)
	else
		$c
};

declare function xqc:filter($a,$b) {
    array:filter($a,function($x) { $x = $b })
};

declare function xqc:repeat-string($a,$b) {
    string-join((1 to $a) ! $b)
};

declare function xqc:anon($head,$parts,$ret,$lastseen) {
	xqc:params($parts,concat($ret, "core:anon($,("),$lastseen)
};

declare function xqc:comment($parts,$ret,$lastseen) {
	let $head := head($parts)/string()
	let $rest := tail($parts)
	return
		if($head = "=#25#02=") then
			xqc:body($rest,$ret,$lastseen)
		else
			xqc:comment($rest,$ret,$lastseen)
};

declare function xqc:detect-group-by($parts) {
    let $head := head($parts)/string()
    return
        if($head eq "=#2#23=") then
            true()
        else if($head eq "=#2#11=" or empty($parts)) then
            false()
        else
            xqc:detect-group-by(tail($parts))
};

declare function xqc:op-let($rest,$ret,$lastseen,$llast,$temp) {
    if($llast eq 2.22) then
        let $lastseen := array:append(array:append(a:pop($lastseen),21.07),20.06)
        return xqc:op-let($rest,concat(
            $ret,
            "=#18=",
            "core:anon($,(",a:last($temp),"),core:item()*,"),$lastseen,20.06,a:pop($temp))
    else
    let $hascomma := $llast eq 2.07 or ($llast eq 2.08 and matches($ret,",$"))
	let $letopener :=
		not($llast = (2.09,2.10) or ($llast eq 2.08 and $hascomma = false())) or
		$llast eq 20.06
	let $letclose := not($llast eq 20.06 or array:size($lastseen) eq 0) and $hascomma eq false()
	let $letcloser :=
		if($letclose and $llast = (2.08,2.11,19.01)) then
			xqc:closer($lastseen,0)
		else
			0
	let $last := array:size($lastseen) - $letcloser
	let $ret :=
		concat(
		    $ret,
			if($letclose) then
				concat(
					xqc:repeat-string($letcloser,")"),
					if(array:get($lastseen,$last) eq 2.10) then ")" else "",
					if($hascomma) then "" else ","
				)
			else "",
			if($letopener) then "(" else "",
			"=#2#09=",
		    concat("($,",replace(head($rest)/string(),"^\$|\s",""))
		)
	let $lastseen :=
		if($letclose) then
			array:subarray($lastseen,1,$last)
		else
			$lastseen
	let $lastseen := if($letclose and a:last($lastseen) eq 2.10) then a:pop($lastseen) else $lastseen
	return xqc:body(tail($rest), $ret, array:append($lastseen,2.09),$temp)
};

declare function xqc:op-comma($rest,$ret,$lastseen) {
    (: FIXME dont close a sequence :)
	(: FIXME add check for nested last :)
	let $closer := xqc:closer($lastseen,0)
	let $s := array:size($lastseen)
	let $lastseen := array:subarray($lastseen,1, $s - $closer)
	let $ret :=
		concat(
			$ret,
			xqc:repeat-string($closer,")"),
			if(array:get($lastseen,$s - 1) eq 21.07) then
			    "),=#27#01=("
			else
			    ","
		)
	return xqc:body($rest,$ret,$lastseen)
};

declare function xqc:op-close-curly($rest,$ret,$lastseen,$llast,$temp) {
	let $lastindex := a:last-index-of($lastseen,20.06)
	let $closes := xqc:filter(array:subarray($lastseen,$lastindex + 1),(2.08,2.11))
	(: add one extra closed paren by consing 2.11 :)
	let $reopen := head($rest)/string() eq "=#20#06="
	let $closes := if($reopen) then $closes else array:append($closes,2.11)
	(: eat up until 20.06 :)
	let $lastseen := array:subarray($lastseen,1,$lastindex - 1)
	let $llast := a:last($lastseen)
	(: close the opening type UNLESS its another opener :)
	(: ALT leave JSON intact :)
	let $ret := concat(
	    $ret,
	    if(floor($llast) eq 21) then
	        ")"
		else
			"",
		if(($llast eq 21.07 or empty($llast)) and matches($ret,"\($") = false()) then
			")"
		else
		    "",
		xqc:repeat-string(array:size($closes),")"),
		if($reopen) then
			","
		else
		    ""
	)
	(: remove opening type UNLESS next is another opener :)
	let $lastseen := if(floor($llast) eq 21 and $reopen) then $lastseen else a:pop($lastseen)
	return xqc:body($rest,$ret,$lastseen,$temp)
};

declare function xqc:op-constructor($no,$rest,$ret,$lastseen) {
    let $ret := concat($ret,xqc:op-str($no),"(")
	let $next := head($rest)/string()
	(: for element etc, check if followed by qname :)
	let $qn := if($next ne "=#20#06=") then $next else ()
	let $rest :=
		if(exists($qn)) then
			tail($rest)
		else
			$rest
	let $ret :=
		if(exists($qn)) then
			concat($ret,$next,",")
		else
			$ret
	return xqc:body($rest,$ret,array:append($lastseen,$no))
};

declare function xqc:op-then($rest,$ret,$lastseen,$llast,$temp){
    let $ret := concat(
	    $ret,
		if($llast eq 2.11) then ")" else "",
		","
	)
	(: if then expect an opener and remove it :)
	let $lastseen :=
		if($llast eq 2.11 or $llast eq 40) then
			a:pop($lastseen)
		else
			$lastseen
	let $last := a:last-index-of($lastseen,2.06)
	let $lastseen := if($last gt 0) then array:append(array:remove($lastseen,$last),2.07) else $lastseen
	return xqc:body($rest,$ret,$lastseen,$temp)
};

declare function xqc:op-assign($rest,$ret,$lastseen,$llast,$temp){
    if(array:get($lastseen,array:size($lastseen) - 1) eq 21.07) then
        xqc:body($rest, concat($ret,","), $lastseen)
    else
    let $ret := concat(
	    $ret,
		if($llast eq 2.11) then ")" else "",
		","
	)
	(: if then expect an opener and remove it :)
	let $lastseen :=
		if($llast eq 2.11) then
			a:pop($lastseen)
		else
			$lastseen
	let $last := a:last-index-of($lastseen,2.09)
	let $lastseen := if($last gt 0) then array:append(array:remove($lastseen,$last),2.10) else $lastseen
	return xqc:body($rest,$ret,$lastseen,$temp)
};

declare function xqc:op-else($rest,$ret,$lastseen,$llast,$temp){
    let $closer := a:last-index-of($lastseen, 2.07)
    let $ret :=
		concat(
		    $ret,
			xqc:repeat-string(array:size($lastseen) - $closer,")"),
			","
		)
	let $lastseen := array:subarray($lastseen, 1, $closer - 1)
    return xqc:body($rest,$ret,array:append($lastseen,2.08),$temp)
};

declare function xqc:op-return($rest,$ret,$lastseen,$llast,$temp){
    if($llast eq 2.22) then
        xqc:body($rest,concat($ret,"=#18=core:anon($,(",a:last($temp),"),core:item()*,("),array:append(array:append(a:pop($lastseen),2.11),2.11),a:pop($temp))
    else
        let $closer := a:last-index-of($lastseen, 2.10)
        let $ret :=
    		concat(
    		    $ret,
    			xqc:repeat-string(array:size($lastseen) - $closer,")"),
    			"),"
    		)
    	let $lastseen := array:subarray($lastseen, 1, $closer - 1)
        return xqc:body($rest,$ret,array:append($lastseen,2.11))
};

declare function xqc:op-close-square($rest,$ret,$lastseen,$llast,$temp) {
    let $ret := concat($ret,
        if($llast = (19.01,20.04) or ($llast eq 20.01 and array:get($lastseen,array:size($lastseen) - 1) eq 19.01)) then
            "))"
        else
            ")")
    let $lastseen :=
        if($llast = 19.01 or ($llast eq 20.01 and array:get($lastseen,array:size($lastseen) - 1) eq 19.01)) then
            a:pop(a:pop($lastseen))
        else
    	    a:pop($lastseen)
	return xqc:body($rest,$ret,$lastseen,$temp)
};

declare function xqc:op-open-square($no,$rest,$ret,$lastseen){
    let $ret :=
		concat(
		    $ret,
			xqc:op-str($no),
			if($no eq 20.04) then "((" else "("
		)
	return xqc:body($rest, $ret, array:append($lastseen,$no))
};

declare function xqc:op-open-curly($rest,$ret,$lastseen,$llast){
    (: ALT leave JSON literal as-is :)
    let $ret := concat($ret,
	    if($llast eq 21.07 or floor($llast) ne 21) then
	        let $next := head($rest)/string()
	        return if(empty($next) or $next eq "=#20#07=") then "(" else "(=#27#01=("
        else
            "(")
    return xqc:body($rest,$ret,array:append($lastseen,20.06))
};

declare function xqc:op-select($rest,$ret,$lastseen,$llast,$temp) {
    let $ret := concat($ret,if($llast eq 19.01) then "," else "=#19#01=(")
    let $lastseen := if($llast = 19.01) then $lastseen else array:append($lastseen,19.01)
    return xqc:body($rest,$ret,$lastseen,$temp)
};

declare function xqc:op-for($rest,$ret,$lastseen,$llast,$temp) {
    xqc:body($rest,$ret,array:append($lastseen,2.21),$temp)
};

declare function xqc:op-in($rest,$ret,$lastseen,$llast,$temp) {
    xqc:body($rest,$ret,array:append(a:pop($lastseen),2.22),$temp)
};

declare function xqc:body-op($no,$rest,$ret as xs:string,$lastseen,$temp){
	let $llast := a:last($lastseen)
	(: FIXME add check for nested last :)
	let $has-filter := $llast eq 19.01
	let $ret := concat($ret,
	    if($has-filter) then
		    if($no eq 20.01) then
		        ","
		    else
		        ")"
		else
		    "")
	let $lastseen :=
	    if($has-filter) then
	        if($no eq 20.01) then
	            $lastseen
	        else
	            a:pop($lastseen)
	    else
	        $lastseen
	let $llast := if($has-filter) then a:last($lastseen) else $llast
	return
        if($no eq 1) then
    		xqc:op-comma($rest,$ret,$lastseen)
    	else if($no eq 2.06) then
    		xqc:body($rest, concat($ret, xqc:op-str($no)), array:append($lastseen,$no))
    	else if($no eq 2.07) then
    		xqc:op-then($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 2.08) then
    	    xqc:op-else($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 2.09) then
            xqc:op-let($rest,$ret,$lastseen,$llast,$temp)
        else if($no = 2.10) then
    		xqc:op-assign($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 2.11) then
    	    xqc:op-return($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 2.21) then
    	    xqc:op-for($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 2.22) then
    		xqc:op-in($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 19.01) then
    	    xqc:op-select($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 20.07) then
    	    xqc:op-close-curly($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 20.02) then
    	    xqc:op-close-square($rest,$ret,$lastseen,$llast,$temp)
    	else if($no eq 20.06) then
            xqc:op-open-curly($rest,$ret,$lastseen,$llast)
        else if($no eq 21.06) then
    		xqc:anon(head($rest)/string(),tail($rest),$ret,$lastseen)
    	else if($no eq 25.01) then
    		xqc:comment($rest,$ret,$lastseen)
    	else if($no eq 26) then
    		xqc:body($rest, concat($ret,","), $lastseen)
    	else if(floor($no) eq 21) then
    		xqc:op-constructor($no,$rest,$ret,$lastseen)
    	else if($no = (20.01,20.04)) then
    		xqc:op-open-square($no,$rest,$ret,$lastseen)
    	else
            xqc:body($rest,concat($ret,xqc:op-str($no)),$lastseen,$temp)
};

declare function xqc:paren-closer($head,$lastseen){
	if(matches($head,"[\(\)]+")) then
	    let $cp := string-to-codepoints($head)
		let $lastseen := fold-left($cp[. eq 40],$lastseen,function($pre,$cur){
		    array:append($pre,$cur)
		})
		return
	        xqc:close($lastseen,count($cp[. eq 41]))
	else
		$lastseen
};


declare function xqc:body($parts,$ret) {
    xqc:body($parts,$ret,[])
};

declare function xqc:body($parts,$ret,$lastseen) {
    xqc:body($parts,$ret,$lastseen,[])
};

declare function xqc:body($parts,$ret,$lastseen,$temp){
	if(empty($parts)) then
		concat($ret, xqc:repeat-string(array:size(xqc:filter($lastseen,(2.08,2.11,20.07,2.18,19.01))), ")"))
	else
		let $head := head($parts)/string()
		let $rest := tail($parts)
		let $llast := a:last($lastseen)
		let $lastseen := if($llast eq 0) then a:pop($lastseen) else $lastseen
		let $lastseen := xqc:paren-closer($head,$lastseen)
		return
			if($head = "=#25#01=") then
				xqc:comment($rest,$ret,$lastseen)
			else if(matches($head,";")) then
				xqc:block($parts, $ret)
			else
				let $rest :=
					if($head = $xqc:fns) then
					    let $next := head($rest)/string() return
					    if(matches($next,"[^\.]\)")) then
    						insert-before(tail($rest),1,element fn:match {
    							element fn:group {
    								attribute nr { 1 },
    								replace($next,"^([^\)]*)\)","$1.)")
    							}
    						})
    					else
    					    $rest
					else
						$rest
				(: array if there was nothing before... :)
				let $head :=
					if($head eq "=#20#01=" and $llast ne 0) then
						"=#20#04="
					else
						$head
				return
					if(matches($head,$xqc:operator-regexp)) then
						xqc:body-op(xqc:op-num($head),$rest,$ret,$lastseen,$temp)
					else
				        if($llast eq 2.21) then
				            xqc:body($rest,$ret,$lastseen,array:append($temp,$head))
				        else
						    xqc:body($rest,concat($ret,$head),if(matches($head,"\(")) then $lastseen else array:append($lastseen,0),$temp)
};

declare function xqc:ximport($parts,$ret) {
	let $rest := subsequence($parts,6)
	let $maybe-at := head($rest)/string()
	return
		if(matches($maybe-at,"at")) then
			xqc:block(subsequence($rest,3),concat($ret,"core:ximport($,",$parts[3]/string(),",",$parts[5]/string(),",",$rest[2]/string(),")"))
		else
			xqc:block($rest,concat($ret,"core:ximport($,",$parts[3]/string(),",",$parts[5]/string(),")"))
};

declare function xqc:block($parts,$ret){
	if(empty($parts)) then
		$ret
	else
		let $val := head($parts)/string()
		return
			if(matches($val,$xqc:operator-regexp)) then
				let $no := xqc:op-num($val)
				return
					if($no eq 2.14) then
						xqc:xversion(tail($parts),$ret)
					else if($no eq 2.16) then
						xqc:xmodule(tail($parts),$ret)
					else if($no eq 2.17) then
						xqc:annot(tail($parts),$ret,"")
					else if($no eq 2.19) then
						xqc:ximport(tail($parts),$ret)
					else
						xqc:body($parts,$ret)
			else
				xqc:body($parts,$ret)
};


declare function xqc:to-op($opnum,$params){
	if(map:contains($params("$operator-map"),$opnum)) then
		concat("core:",$params("$operator-map")($opnum))
	else
		concat("core:",replace($params("$operators")($opnum)," ","-"))
};

declare function xqc:escape-for-regex($key,$params) as xs:string {
	let $arg := $params("$operators")($key)
	let $pre := "(^|[\s,\(\);\[\]]+)"
	return
		if(matches($arg,"\p{L}+")) then
			if($key eq 2.17) then
			    "(\s?|;?)" || $arg || "(\s?)"
			else if($key eq 21.06) then
				$pre || $arg || "([\s" || $xqc:ncname || ":]*\s*\((\$|\)))"
			else if(floor($key) eq 21) then
				$pre || $arg || "([\s\$" || $xqc:ncname || ",:]*=#20#06)"
			else if($key eq 2.04 or floor($key) eq 22) then
				$pre || $arg || "(\()"
			else if(floor($key) eq 24) then
				$pre || $arg || "(\s)"
			else if($arg = "if") then
				$pre || $arg || "(\s?)"
			else if($arg = "then") then
				"\)(\s*)" || $arg || "(\s?)"
			else
				"(^|\s)" || $arg || "(\s|$)"
		else
			let $arg := replace($arg,"(\.|\[|\]|\\|\||\-|\^|\$|\?|\*|\+|\{|\}|\(|\))","\\$1")
			return
				if($key eq 26) then
					"(\s?)" || $arg || "([^=]\s*[^\p{L}_])"
				else if($key eq 2.10) then
					"(\s?):\s*=([^#])"
				else if($key = (8.02,17.02)) then
					"(^|\s|[^\p{L}\p{N}]\p{N}+|[\(\)\.,])" || $arg || "([\s\p{N}])?"
				else if($key = (8.01,9.01,20.03)) then
					"([^/])" || $arg || "(\s*[^,\)\{])"
				else
					"(\s?)" || $arg || "(\s?)"
};

declare function xqc:unary-op($op){
	if(floor($op) eq 17) then $op else $op + 9
};

declare function xqc:op-num($op) as xs:decimal {
	if($op ne "") then
	    xs:decimal(replace($op,"^=#(\p{N}+)#?(\p{N}*)=$","$1.$2"))
	else
	    0
};

declare function xqc:op-str($op){
	concat("=#",replace(string($op),"\.","#"),"=")
};
