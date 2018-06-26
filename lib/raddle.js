const Observable = require("rxjs/Observable").Observable;
const fs = require("fs");
const ops = require("./operator-trie.json");

function filter(path,cp,pos){
	if(path.length && path[0]._k[pos] != cp) path.shift();
	return path.length ? path : null;
}
function find(entry,cp,word,path){
	if(Array.isArray(entry)){
		let pos = word.length - 1;
		let len = entry.length;
		var ret;
		for(var i = 0; i < len; i++){
			let a = entry[i];
			if("_v" in a) {
				if(a._k[pos] == cp){
					if(path[path.length-1] !== a) {
						path.push(a);
					}
					ret = a;
				}
			} else {
				if(a[cp] !== undefined) {
					return [a[cp],path];
				}
			}
		}
		if(ret !== undefined) return [ret,path];
		return [filter(path,cp,pos),[]];
	} else if(!("_v" in entry)){
		return [entry[cp],path];
	} else {
		let pos = word.length - 1;
		if(entry._k[pos] === cp) {
			if(path[path.length-1] !== entry) path.push(entry);
			return [entry,path];
		}
		return [filter(path,cp,pos),[]];
	}
}

const opMap = {
	802: "add",
	903: "divide",
	904: "multiply",
	5003: "zero-or-one",
	3904: "zero-or-more",
	3802: "one-or-more",
	2003: "$_"
};

const tpl = (t,v,o,d) => { return {t:t,v:v,o:o,d:d}; };

const openTpl = (d = 0) => tpl(1,1,"(",d);

const commaTpl = (d = 0) => tpl(3,100,",",d);

const closeTpl = (d = 0) => tpl(2,2,")",d);

const incr = a => a.map(x => {
	x.d++;
	return x;
});

function process(tpl,state) {
	const t = tpl.t, v = tpl.v;
	if(t == 4){
		if(v == 119 || v == 2003) {
			if(opMap.hasOwnProperty(v)) tpl.o = opMap[v];
			state.r = state.r.concat([tpl,{t:1,v:1},{t:2,v:2}]);
		} else if(v > 3800) {
			state.r = [{t:4,v:v,o:opMap[v]},{t:1,v:1},...state.r,{t:2,v:2}];
		} else if(v > 300 && v < 2100) {
			const mappedOp = opMap.hasOwnProperty(v) ? opMap[v] : tpl.o;
			// if original operator is not same, it was an infix operator
			// so mark it for precedence and closing
			if(tpl.o !== mappedOp) {
				tpl.o = mappedOp;
				tpl.b = true;
			}
		}
		state.r.push(tpl);
	} else {
		state.r.push(tpl);
	}
	state.depth = tpl.d;
	return state;
}

function reduceAround(arr,fn,seed,lastSeed,nextSeed) {
	const l = arguments.length;
	seed = l < 3 ? arr.shift() : seed;
	let tmp = {
		out:seed,
		init:false,
		last:lastSeed,
		at: l < 3 ? 1 : 0
	};
	// call one 'before' to set entry
	tmp = arr.reduce(function(tmp,next){
		if(!tmp.init) {
			tmp.entry = next;
			tmp.init = true;
			return tmp;
		}
		tmp.out = fn.call(arr,tmp.out,tmp.entry,tmp.last,next,tmp.at,arr);
		tmp.last = tmp.entry;
		tmp.entry = next;
		tmp.at = tmp.at + 1;
		return tmp;
	},tmp);
	return !tmp.init ? tmp.out : fn.call(arr,tmp.out,tmp.entry,tmp.last,nextSeed,tmp.at);
}

function expandBinOps(r) {
	const ret = [];
	const o = [];
	let prev;
	const idx = {};
	const closeBin = (last,tpl) => {
		// close one at same depth
		if(last) {
			if(tpl.d <= last.d) {
				last.closed = ret.length;
				ret.push(closeTpl(tpl.d));
				o.pop();
			}
			if(tpl.d < last.d) {
				// close all at lower depth
				// reset last binary at depth
				prev = void 0;
				// recurse
				closeBin(o.last(),tpl);
			}
		}
	};
	for(var i=0;i<r.length;i++) {
		const tpl = r[i];
		const t = tpl.t;
		if(t === 1 || t === 10 || t === 6) {
			// keep track depth increases (in the result)
			ret.push(tpl);
			idx[tpl.d] = ret.length;
		} else if(t == 4) {
			if(tpl.b) {
				closeBin(o.last(),tpl);
				const last = ret.last();
				const preceeds = prev && tpl.v > prev.v;
				// if we have preceding then use its index, else use last opening
				const insert = preceeds ? prev.i : idx[last.d];
				//console.log(tpl,ret,insert,last,idx);
				// if preceding encountered, operator should be swapped, but its close too
				if(preceeds) {
				// 1. un-close prev
					ret.splice(prev.closed,1);
					// 2. re-mark prev as open
					o.push(prev);
				}
				// default operations:
				// 3. insert open + tpl
				ret.splice(insert,0,openTpl());
				ret.splice(insert,0,tpl);
				// 4. push comma
				ret.push(commaTpl());
				// 5. keep track of insertion point
				tpl.i = ret.length;
				// 6. mark as open
				o.push(tpl);
				// 7. store as prev
				prev = tpl;
			} else {
				// keep track depth increases (in the result)
				//console.log("op",tpl);
				idx[tpl.d] = ret.length;
				ret.push(tpl);
			}
		} else {
			// some close, unwrap any open ops
			// we don't want to interfere with bin-op, because it would close them to soon
			if(t === 3 || t === 2 || t === 0) {
				closeBin(o.last(),tpl);
				ret.push(tpl);
				if(t !== 2) idx[tpl.d] = ret.length;
			} else {
				ret.push(tpl);
			}
		}
	}
	//console.log(ret);
	return ret;
}

const types = [
	"item",
	"atomic",
	"string",
	"numeric",
	"integer",
	"number",
	"double",
	"decimal",
	"float",
	"function",
	"array",
	"map"
];

function charReducer(state,next) {
	const char = state.char;
	if(char === undefined) {
		state.emit = void 0;
		state.char = next;
		return state;
	}
	if(next == EOF) {
		state.emit = state.emit && state.tpl.t == 0 ? void 0 : {t:0, v:0, o:EOF};
		return state;
	}
	const oldType = state.type;
	const oldComment = state.comment;
	const buffer = state.buffer;
	const oldString = state.string;
	//const oldTpl = state.tpl;
	const zero = oldComment || state.qname || state.var || state.number ? false : oldString === 0;
	const b = buffer + char;
	const tmp = zero ? find(state.trie,char,b,state.path) : [[],[]];
	const trie = tmp[0];
	const path = tmp[1];
	let match = 0;
	if(!trie) {
		match = 2;
	} else if(Array.isArray(trie)) {
		match = !trie.length ? 2 : trie[0]._k === b ? 3 : 0;
	} else if("_k" in trie) {
		match = trie._k === b ? 1 : (path.length > 0 && path[0]._k === b) ? 5 : 0;
	}
	if(match !== 2) {
		const tmp = find(trie,next,b + next,[...path]);
		const trie2 = tmp[0];
		if(trie2 && ((Array.isArray(trie2) && trie2.length > 0) || "_k" in trie2)) {
			// still a match, stop this one
			match = 0;
		} else if(match == 3) {
			//console.log(trie[0],next);
			if(trie[0]._v > 4 && /[a-z]/.test(next)) match = 2;
			//match = 0;
		} else if(match === 0) {
			// next won't match, so neither will this
			match = 2;
		}
	}
	let type;
	// skip anything but closers
	if(match == 1) {
		type = trie._v;
	} else if(match == 3) {
		type = trie[0]._v;
	} else if(match == 5) {
		type = path[0]._v;
	} else if(/\s/.test(char)) {
		type = 10;
	} else if(/[0-9]/.test(char)) {
		type = 11;
	} else if(/[a-zA-Z]/.test(char)) {
		type = 12;
	} else {
		type = 0;
	}
	//console.log("ct",char,type);
	//if((type == 802 || type == 904 || type == 2003) && state.lastQname && types.includes(state.lastQname.v)) {
	//	type += 3000;
	//}
	let variable = (zero && type == 9) || (state.var && type != 10);
	let number = (zero && (type == 11 || (type == 8 && oldType != 8 && /[0-9]/.test(next)))) || (state.number && (type === 0 || type == 11));
	let qname = (zero && !variable && !number && type != 10 && match == 2) || (state.qname && type != 10);
	let stop = ((variable || qname) && /[^a-zA-Z0-9\-_:]/.test(next)) || (number && /[^0-9.]/.test(next));
	if(stop && !state.var) variable = false;
	let flag;
	if(variable || number || qname) {
		flag = 0;
	} else if(zero) {
		if(type == 6 || type == 7) {
			flag = 1; // open string :)
		} else if(type == 2501) {
			flag = 3; // open comment :)
			//} else if(type == 3 && oldType != 3 && next != "{" && opencount[0] > 0) then
			//    11 (: open enc-expr, TODO add double curly to TRIE :)
			//else if($enc-expr and $type == 4 and $has-quot == 0 and $next ne "}") then
			//    12 (: close enc-expr, TODO add double curly to TRIE :)
		} else {
			flag = 0;
		}
	} else {
		// for the parser we need at least to escape a single quote char, but it should be handled by the trie :)
		if((oldString == 6 && char == "\"" && next !== "\"") || (oldString == 7 && char == "'")) {
			flag = 2; //(: close string :)
		} else if(oldComment && char == ":" && next == ")") {
			flag = 4; //(: close comment :)
			//else if($attrkey == false() and empty($type) and head($opencount) gt 0) then
			//    9
			//else if($attrkey and $type == 509 and head($opencount) gt 0) then
			//    10
		} else {
			flag = 0;
		}
	}
	let tpl;
	if(!flag) {
		if(stop && type != 9) {
			tpl = {t:variable ? 5 : number ? 8 : 6,v:b};
		} else if(match != 2 && match !== 0) {
			let t = type == 1 || type == 3 || type == 2001 ? 1 :
				type == 2 || type == 4 || type == 2002 ? 2 :
					type == 100 ? 3 :
						type == 5 ? 0 :
							type == 9 ? 10 :
								type == 8 ? 13 :
									4;
			tpl = {t:t,v:type,o:b};
		}
	} else if(flag == 2 || flag == 4) {
		tpl = {t:flag == 2 ? 7 : 9,v:buffer};
	}

	// if the result is an array, it was expanded
	// in this case, emit will be overridden by process...
	// we should only just buffer 2 levels of depth:
	// one for the type and one for the occurrence indicator...
	if((zero && type == 10 && buffer == "") || tpl || flag) {
		state.buffer = "";
	} else {
		state.buffer = b;
	}
	if(qname) state.lastQname = tpl;
	// FIXME hack to skip a char
	state.char = flag == 4 ? void 0 : next;
	state.var = variable && !stop;
	state.number = number && !stop;
	state.qname = qname && !stop;
	state.type = type;
	if(tpl) {
		tpl.line = state.line;
		tpl.column = state.column;
		state.tpl = tpl;
	}
	state.emit = tpl;
	let newline = false;
	if(char == "\n") newline = true;
	if(newline) {
		state.line++;
		state.column = 1;
	} else {
		state.column++;
	}

	state.trie = match > 0 ? ops : trie;
	state.path = match > 0 ? [] : path;
	if(flag == 1) {
		state.string = type;
	} else if(flag == 2) {
		state.string = 0;
	} else if(flag == 3) {
		state.comment = true;
	} else if(flag == 4) {
		state.comment = false;
	}
	return state;
}

function toRdl(ret,entry) {
	const t = entry.t, v = entry.v;
	if(t === 0) {
		ret += (";\n\n");
	} else if(t == 7) {
		ret += (`"${v}"`);
	} else if(t == 6 || t == 8) {
		ret += (v);
	} else if(t == 9) {
		ret += ("(:"+v+":)");
	} else {
		ret += (entry.o);
	}
	return ret;
}

function toL3(ret,entry,last,next){
	//console.log(ret,entry,last,next);
	let $t = entry.t;
	let $v = entry.v;
	let r = [];
	if($t == 1) {
		if($v == 3) {
			r = [15];
		} else if($v == 1) {
			//(: TODO check for last operator :)
			if(!last || last.t == 1) {
				//console.log(last);
				r = [14,""];
			}
		}
	} else if($t == 2) {
		if(next && next.t == 1 && next.v == 1) {
			r = [18];
		} else {
			r = [17];
		}
	} else if($t == 7) {
		r = [3,$v];
	} else if($t == 8) {
		r = [12,$v];
	} else if($t == 6) {
		if(/#[0-9]$/.test($v)) {
			r = [4,$v+""];
		} else {
			r = next && next.t == 1 && next.v == 1 ? [14,$v] : [3,$v];
		}
	} else if($t == 4 || $t == 10) {
		r = [14,entry.o];
	} else if($t == 5) {
		r = [3,$v];
	} else if($t == 9) {
		r = [8,$v];
	} else if($t == 11) {
		r = [1,$v];
	} else if($t == 12) {
		r = [2,$v];
	} else if($t == 13) {
		r = [14,"$.",17];
	}
	//return r ? ret.concat(r) : ret;//Observable.from(r) : Observable.empty();
	for(let a of r) ret.next(a);
	return ret;
}

const tokenize = function(state,$chars) {
	return Observable.create($o => {
		$chars.subscribe({
			next(cur) {
				charReducer(state,cur);
				if(state.emit) $o.next(state.emit);
			},
			complete() {
				$o.complete();
			}
		});
	});
	//return $chars.scan((state,cur) => charReducer(state,cur),state).filter(state => state.emit).map(state => state.emit);
};

function lex($tpls) {
	let state = {
		emit:false,
		depth:0,
		i:{},
		r:[],
		o:[]
	};
	return Observable.create($o => {
		$tpls.subscribe({
			next(tpl){
				const r = state.r;
				let depth = state.depth;
				//console.log(tpl,r,depth);

				if(tpl.t == 2) {
					depth--;
					if(depth < 0) {
						console.log(r);
						throw new Error("Incorrect depth of close");
					}
					if(!state.tpl || state.tpl.t == 3) throw new Error("Incorrect position of close");
				} else if(tpl.t == 1) {
					state.i[depth] = r.length;
					depth++;
				}
				tpl.d = depth;
				//console.log(depth,tpl);
				state = process(tpl,state,r);
				state.tpl = tpl;
				// never emit tpl, oldTpl can be overriden
				if(tpl.t === 0) {
					if(depth !== 0){
						console.log(tpl);
						throw new Error("Incorrect depth at EOF");
					}
					reduceAround(expandBinOps(state.r),toL3,$o);
					//$o.next(expandBinOps(state.r).reduce(toRdl,""));
					state.r = [];
				}
			},
			complete(){
				$o.complete();
			}});
	});
}

const EOF = String.fromCharCode(25);

const fromStream = function (stream) {
	stream.pause();

	const finishEventName = "end";
	const dataEventName = "data";

	return Observable.create(function (observer) {
		function dataHandler (data) {
			observer.next(data);
		}

		function errorHandler (err) {
			observer.error(err);
		}

		function endHandler () {
			observer.next(EOF);
			observer.complete();
		}

		stream.addListener(dataEventName, dataHandler);
		stream.addListener("error", errorHandler);
		stream.addListener(finishEventName, endHandler);

		stream.resume();

		return function () {
			stream.removeListener(dataEventName, dataHandler);
			stream.removeListener("error", errorHandler);
			stream.removeListener(finishEventName, endHandler);
		};
	});//.publish().refCount();
};

const initTokenState = () => {
	return {
		type:0,
		buffer:"",
		string:0,
		flag:0,
		trie:ops,
		var:false,
		ws:false,
		number:false,
		comment:false,
		qname: false,
		line: 1,
		column: 1,
		path: [],
		tpl: {},
		emit:void 0
	};
};

exports.parse = function(path){
	const state = initTokenState();
	return lex(fromStream(fs.createReadStream(path)).mergeMap(chunk => tokenize(state,Observable.from(chunk.toString()))));
};

exports.parseString = function(str){
	const state = initTokenState();
	return lex(tokenize(state,Observable.from(str+EOF)));
};
