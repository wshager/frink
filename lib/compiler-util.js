const camelCase = require("./util").camelCase;

function prefixAndName(str,defaultNS) {
	var hasPrefix = /:/.test(str);
	var prefix = hasPrefix ? str.replace(/^([^:]*):.*$/, "$1") : defaultNS;
	var name = !str ? "seq" : hasPrefix ? str.replace(/^[^:]*:(.*)$/, "$1") : str;
	return { prefix: prefix, name: name };
}

function normalizeName(str,defaultNS) {
	const { prefix, name } = prefixAndName(str,defaultNS);
	return { prefix: prefix, name: camelCase(name) };
}

exports.prefixAndName = prefixAndName;
exports.normalizeName = normalizeName;

const { CALL, MODULE, IMPORT, EXPORT, PRIVATE, VAR, IF, AND, OR, SEQ, QUOT, TYPESIG, TYPESEQ, THEN, ELSE, TYPED, EXACTLY_ZERO, EXACTLY_ONE, ZERO_OR_ONE, ZERO_OR_MORE, ONE_OR_MORE, MORE_THAN_ONE } = require("./annot-const");

function _findInClosure(quotes,seqs,depth,value) {
	for(let i = depth; i > 0; i--) {
		if(quotes[i] && !quotes[i]["."] && quotes[i][value]) return true;
		if(seqs[i] && !seqs[i]["."] && seqs[i][value]) return true;
	}
}


/*function detectAndOr(node) {
	return !!node.inode.$args.filter(x => {
		return andOrRe.test(x.$name);
	}).length;
}
const ifAndOrRe = /^(n\.)?(if|and|or)$/;
function detectIfAndOr(inode) {
	!!inode.$args.filter(x => {
		return x ? ifAndOrRe.test(x.$name) || (x.$args && x.$args.length ? detectIfAndOr(x) : false) : false;
	}).length;
}*/

// TODO merge with subTypeOf?
const commonSubType = (a,b) => {
	if(a === b) return a;
	if(a == "item" || b == "item") return "item";
	switch (b) {
	case "string":
	{
		if(subTypeOf("atomic",a)) return "atomic";
		return "item";
	}
	case "number":
	case "integer":
	case "decimal":
	case "double":
	case "float":
	{
		if(subTypeOf("numeric",a)) return "numeric";
		if(subTypeOf("atomic",a)) return "atomic";
		return "item";
	}
	case "atomic":
	{
		if(subTypeOf("atomic",a)) return "atomic";
		return "item";
	}
	default:
		return "item";
	}
};

const commonOccurs = (a,b) => {
	if(a === b) return a;
	switch(b) {
	case 0:
	{
		if(a === 1 || a === 2) return 2;
		return 3;
	}
	case 1:
	{
		if(a === 0 || a === 2) return 2;
		return 3;
	}
	case 2:
	{
		if(a === 0 || a === 1) return 2;
		return 3;
	}
	case 3:
	{
		return 3;
	}
	case 4:
	{
		if(a === 5) return 4;
		return 3;
	}
	case 5:
	{
		if(a === 4) return 4;
		return 3;
	}
	}
};

const traverseIf = (nodeMapGet,a) => {
	if(!a) {
		console.log("no node to annot "+a);
		return {dataType:"item",occurs:2};
	}
	if(a.type == IF) {
		const traverseIfBound = traverseIf.bind(null,nodeMapGet);
		const thenBranch = _Observable.Observable.from(a.ref[0].node.values()).map(nodeMapGet).concatMap(traverseIfBound);
		const elseBranch = _Observable.Observable.from(a.ref[1].node.values()).map(nodeMapGet).concatMap(traverseIfBound);
		var c = thenBranch.concat(elseBranch);

		return c.reduce((annot,cur) => {
			// choose as broad of a type as possible
			const dataType = annot.dataType, occurs = annot.occurs, curDataType = cur.dataType, curOccurs = cur.occurs;
			return {
				dataType: commonSubType(dataType,curDataType),
				occurs: commonOccurs(occurs,curOccurs)
			};
		});
	} else {
		if(!a.annot || Array.isArray(a)) {
			//console.log(a);
			console.log(Array.isArray(a) ? a+" annot is an array" : a+" has no annot");
			return  _Observable.Observable.of({dataType:"item",occurs:2});
		}
		return isObservable(a.annot) ? a.annot : _Observable.Observable.of(a.annot);
	}
};



const getOccurs = (nodeMap,annot) => {
	const occurs = nodeMap.get(annot.node.last()).node.name;
	switch(occurs) {
	case "empty":
		return 0;
	case "exactly-one":
		return 1;
	case "zero-or-one":
		return 2;
	case "zero-or-more":
		return 3;
	case "one-or-more":
		return 4;
	case "more-than-one":
		return 5;
	default:
		throw new Error("Unknown occurence "+annot);
	}
};

const sizeToOccurs = size => {
	if(size === 0) return EXACTLY_ZERO;
	if(size === 1) return EXACTLY_ONE;
	if(size > 1) return MORE_THAN_ONE;
};

const getDataType = (nodeMap,annot) => {
	const hasOccurs = annot.node.name == "occurs";
	const dataTypeRef = hasOccurs ? nodeMap.get(annot.node.first()) : annot;
	return {
		dataType: dataTypeRef.node.name,
		occurs: hasOccurs ? getOccurs(nodeMap,annot) : 1,
		dataTypeRef: dataTypeRef
	};
};

const expandDataType = (nodeMap,annot) => {
	let {dataType, occurs, dataTypeRef} = getDataType(nodeMap,annot);
	// get the actual data constructor by referencing the function in "type"
	// this should be safer than using eval
	// first handle inner types
	switch(dataType) {
	case "function":
		// TODO
		break;
	case "map": {
		const keyTypeRef = nodeMap.get(dataTypeRef.node.first());
		const valTypeRef = nodeMap.get(dataTypeRef.node.last());
		// create bound function
		// key + value (for Frink) should always be 1, if not error
		const keyAnnot = getDataType(nodeMap,keyTypeRef);
		annot.keyDataType = keyAnnot.dataType;
		if(keyAnnot.occurs != 1) throw new Error("Map key has wrong cardinality");
		const valAnnot = getDataType(nodeMap,valTypeRef);
		if(valAnnot.occurs != 1) throw new Error("Map value has wrong cardinality");
		annot.valDataType = valAnnot.dataType;
		break;
	}
	case "array": {
		const valTypeRef = nodeMap.get(dataTypeRef.node.last());
		// create bound function
		// value should always be 1, if not error
		const valAnnot = getDataType(nodeMap,valTypeRef);
		if(valAnnot.occurs != 1) throw new Error("Map value has wrong cardinality");
		// so... we can pass valType to all children, but that would be O(n)
		// instead pass it to the first and let that propagate
		annot.valDataType = valAnnot.dataType;
		break;
	}
	default:
	}
	annot.dataType = dataType;
	annot.occurs = occurs;
	return annot;
};

const subTypeOf = (p,b) => {
	// the empty seq always matches
	if(!p || !b) return true;
	if(p == "item" || b == "item") return true;
	if(p == "atomic") {
		switch(b) {
		case "atomic":
		case "boolean":
		case "string":
			return true;
		case "numeric":
			return true;
		default:
			return subTypeOf("numeric",b);
		}
	} else if(p == "numeric") {
		switch(b) {
		case "integer":
		case "number":
		case "double":
		case "float":
		case "decimal":
			return true;
		default:
			return false;
		}
	} else if(p == "string") {
		return b == "string";
	}
};

const matchOccurs = (s,t) => {
	if(t === EXACTLY_ONE) {
		return !(s === EXACTLY_ZERO || s === MORE_THAN_ONE);
	}
	if(t === ZERO_OR_ONE) {
		return s !== MORE_THAN_ONE;
	}
	if(t === ZERO_OR_MORE) {
		return true;
	}
	if(t === ONE_OR_MORE) {
		return s != EXACTLY_ZERO;
	}
};

const matchTypes = (s,t) => {
	if(subTypeOf(t,s) || s === t) return true;
};

const matchTypesOccurs = (src,trg) => {
	for(let i = 0; i < src.length; i++) {
		const s = src[i];
		if(!s) throw new Error("No typedef src");
		const t = trg[i];
		if(!t) throw new Error("No typedef trg");
		if(Array.isArray(s)) {
			for(const s1 of s) {
				if(!s1) {
					//console.log(s);
					throw new Error("No typedef src1");
				}
				if(!matchOccurs(s1.occurs,t.occurs) || !matchTypes(s1.dataType,t.dataType)) {
					//console.log(s,t);
					return false;
				}
			}
		} else {
			if(!matchOccurs(s.occurs,t.occurs) || !matchTypes(s.dataType,t.dataType)) {
				//console.log(s,t);
				return false;
			}
		}
	}
	return true;
};

const detectIfExternalRefs = (nodeMap,refs) => {
	const inIao = [];
	for(let i=0,l=refs.length;i<l;i++) {
		const x = refs[i];
		if(x.type == IF || x.type == AND || x.type == OR) {
			inIao.push(x);
		} else if(x.type == THEN) {
			//console.log("IAO closing",inIao[inIao.length - 1]+"");
			inIao.pop();
		} else if(x.type == 17 && (x.ref.type == AND || x.ref.type == OR)) {
			//console.log("IAO closing",inIao[inIao.length - 1]+"");
			inIao.pop();
		}
		if(inIao.length && x.type == VAR) {
			if(x.external) {
				const last = inIao.last();
				//console.log("inIao",x+"",x.external,last+"");
				last.external = true;
			}
		}
	}
};


function getDef(modules,prefix,name,arity) {
	// arity is the arity searched for, not the actual one (for rest-param funcs)
	if(!modules[prefix]) modules[prefix] = {};
	if(!modules[prefix][name]) modules[prefix][name] = {};
	let def = modules[prefix][name][arity];
	if(!def) def = modules[prefix][name]["N"];
	if(!def) def = [];
	if(Array.isArray(def)) {
		const observer = new _Subject.Subject();
		def.push(observer);
		modules[prefix][name][arity] = def;
		return {annot:observer};
	}
	//if(Array.isArray(def)) {
	//	console.log("no def yet",def);
	//	def.push(addAnnotAndCheck);
	//} else {
	//	addAnnotAndCheck(def);
	//}
	//modules[prefix][name][arity] = def;
	return def;
}

function setDef(modules,prefix,name,arity,def) {
	//console.log(modules,prefix,name,arity,def);
	if(!modules[prefix]) modules[prefix] = {};
	if(!modules[prefix][name]) modules[prefix][name] = {};
	const observers = modules[prefix][name][arity];
	//const qname = (prefix ? prefix + ":" : "") + name + "#" + arity;
	modules[prefix][name][arity] = def;
	if(Array.isArray(observers)) {
		//console.log("obs",qname,observers);
		observers.forEach(observer => {
			observer.next(def.annot);
			observer.complete();
		});
	}
}

const tuplify = p => p.map(x => {
	return Array.isArray(x) ? tuplify(x) : {dataType:x.dataType,occurs:x.occurs};
});
const stringify = p => JSON.stringify(tuplify(p));



const moduleAccumulator = (modules,ref) => {
	/*if(ref.type == MODULE) {
		// these may coincide
		const prefix = ref.node.first().valueOf();
		const uri = ref.node.last().valueOf();
		if(modules[prefix] && modules[prefix].$uri !== uri) {
			throw new Error("Namespace prefix collision! Use may use only one prefix at a time");
		}
		modules[prefix] = {};
		modules[prefix].$uri = uri;
	} else if(ref.type == EXPORT || ref.type == VAR) {
		ref.analyze();
		const { prefix, name } = prefixAndName(ref.name,"fn");
		if(ref.typesig && ref.typesig.node.name == "function") {
			const typeseq = ref.typesig.ref[0].ref;
			let arity = ref.arity;
			if(arity) {
				const lastParam = typeseq[typeseq.length - 1];
				if(lastParam.node.name == "...") {
					arity = "N";
				}
			}
			// TODO pass default ns prefix with cx
			modules[prefix][name+"#"+arity] = ref;
		} else {
			modules[prefix][name] = ref;
		}
	}*/
	if(ref.type == MODULE || ref.type == EXPORT || ref.type == VAR) {
		ref.analyze(null,modules,null,true);
	}
	return modules;
};
