const _compilerUtil = require("./compiler-util");

const _util = require("./util");

const Call = require("./Call").Call;

const _Observable = require("rxjs/Observable");

const { CALL, MODULE, IMPORT, EXPORT, PRIVATE, VAR, IF, AND, OR, SEQ, QUOT, TYPESIG, TYPESEQ, THEN, ELSE, TYPED, EXACTLY_ZERO, EXACTLY_ONE, ZERO_OR_ONE, ZERO_OR_MORE, ONE_OR_MORE, MORE_THAN_ONE } = require("./annot-const");

class Close {
	constructor(type,ref,index) {
		this.$type = type;
		this.$ref = ref;
		this.$index = index;
	}
	get index() {
		return this.$index;
	}
	get type() {
		return this.$type;
	}
	get ref() {
		return this.$ref;
	}
	toString() {
		return `Close[${this.type},${this.index},${this.ref}]`;
	}
	analyze(nodeMap,modules,assigMap,shallow) {
		// perform type check on close of Call
		if(this.type == 18) {
			//console.log("chained",this.ref+"");
			return;
		}
		const ref = this.ref;
		if(ref.analyzed) return;
		console.log("analyze close "+ref);
		nodeMap = nodeMap || ref.nodeMap;
		if(!nodeMap) throw new Error("No nodeMap found");
		const nodeMapGet = nodeMap.get.bind(nodeMap);
		ref.analyzed = true;
		const type = ref.type;
		if(type == AND || type == OR) {
			ref.annot = {dataType:"boolean",occurs:1};
			const first = nodeMap.get(ref.node.first());
			//console.log(ref+" places infix on "+next);
			first.infix = ref.type;
			first.isBoolean = true;
			const last = nodeMap.get(ref.node.last());
			last.isBoolean = true;
		} else if(type == IF) {
			ref.annot = _compilerUtil.traverseIf(nodeMapGet,ref);//.concatMap(x => x.annot);
			//console.log("ifAnnot",ref.annot);
			//if(ref.annot.filter(x => !x || Array.isArray(x)).length) throw new Error("has undef");
		} else if(type == TYPED) {
			const typed = nodeMap.get(ref.node.last());
			const typeseq = nodeMap.get(typed.typesig.node.first());
			const parent = nodeMap.get(ref.node.parent.inode);
			ref.annot = _compilerUtil.expandDataType(nodeMap,nodeMap.get(typed.typesig.node.last()));
			ref.arity = typeseq.node.count();
			//console.log(parent+"");
			if(parent.type == QUOT || parent.isLetRet) typed.isReturn = true;
			ref.typeseq = typeseq;
		} else if(type == QUOT) {
			if(shallow) throw new Error("Shallow");
			const parent = nodeMap.get(ref.node.parent.inode);
			const typesig = ref.typesig;
			let params = [];
			if(typesig) {
				if(typesig.node.name != "function") throw new Error(this+" type is not function");
				const typeseq = nodeMap.get(typesig.node.first());
				// TODO walk over all vars and detect (re-)assignments and count references
				// FIXME take into account self-assigments..
				// TODO detect external vars by finding numbers among vars
				params = typeseq.ref.map(_compilerUtil.expandDataType.bind(null,nodeMap));
				ref.annot = parent.type == EXPORT || parent.type == TYPED ? parent.annot : null;
			} else {
				console.log("detect param");
				// count params, note that nested quots are traversed
				const detectParams = ref => ref.filter(ref => ref.type == VAR && typeof ref.name == "number");
				params = detectParams(ref.ref).map(param => {
					param.dataType = "item";
					param.occurs = 2;
					return param;
				});
				//console.log(params);
				ref.annot = {
					dataType:"item",
					occurs: 2
				};
			}
			// start by annotating params
			assigMap = params.reduce((assigMap,v,i) => {
				assigMap[i + 1] = [{name:i + 1,annot:v, index:v.index}];
				return assigMap;
			},assigMap);
			console.log(assigMap);
			// try to determine if "if" references external para
			ref.assigMap = assigMap;
			// mark last as "return"
			const lastRef = nodeMap.get(ref.node.last());
			lastRef.isReturn = true;
			ref.ref.forEach(r => {
				r.analyze(nodeMap,modules,assigMap || {});
			});
			// TODO can this be done in analyze?
			//detectIfExternalRefs(nodeMap,ref.ref);

			if(!ref.annot) {
				//console.log(this.node.parent);
				throw new Error("Quot has no type annotation: ");
			}
			if(!lastRef.annot) {
				//throw new Error("lastRef has no annotation");
			}
			//if(!matchTypesOccurs([lastRef.annot],[this.annot])) {
			//throw new Error("Mismatch in function: "+parent+" => "+stringify([lastRef.annot])+" != "+stringify([this.annot]));
			//} else {
			//console.log("Types match in function: "+parent+" => "+stringify([lastRef.annot])+" != "+stringify([this.annot]));
			//}

		} else if(type == CALL) {
			if(ref.node.name != "xq-version") {
				//console.log("analyze call "+ref);
				//const parent = nodeMap.get(ref.node.parent.inode);
				//if(parent.type == TYPED) return;
				//console.log("parent: "+parent);
				const ichildren = ref.node.values();
				const { prefix, name } = _compilerUtil.prefixAndName(ref.node.name,"fn");
				let arity = ichildren.length;
				//const qname = (prefix ? prefix + ":" : "") + name + "#" + arity;
				ref.annot = _compilerUtil.getDef(modules,prefix,name,arity).annot;
				if(ref.annot instanceof Call) {
					ref.typeCheck(nodeMap,modules);
				} else if(_util.isObservable(ref.annot)){
					//console.log("Subj annot "+ref);
					ref.annot.subscribe(annot => {
						//console.log("DEF annot loaded",annot);
						ref.annot = annot;
						ref.typeCheck(nodeMap,modules);
					});
				} else {
					throw new Error("No annot or Promise");
				}
				let exportDef = modules[prefix][name][arity];
				if(!exportDef) {
					arity = "N";
					exportDef = modules[prefix][name]["N"];
				}
				if(!exportDef) throw new Error("Nodef");
				ref.arity = arity;
				ref.value = exportDef;
			}
		} else if(type == SEQ) {
			if(!nodeMap) throw new Error("No nodeMap found on Seq");
			// try to determine seqType
			const ichildren = ref.node.values();
			let size = ichildren.length;
			const refs = ref.ref.length ? ref.ref : ichildren.map(x => nodeMap.get(x));

			if(size > 0){
				const first = refs[0];
				if(refs.filter(x => x.type == AND || x.type == OR).length === size) {
					console.log("hasAndOr "+ref);
					ref.hasAndOr = true;
					ref.annot = {
						dataType:"boolean",
						occurs:1
					};
				} else if(first.type == VAR && first.isAssignment) {
					ref.isLetRet = true;
					const assigs = refs.filter(x => x.type == VAR && x.isAssignment);
					const assigMap = assigs.reduce((assigMap,v) => {
						if(!assigMap[v.name]) assigMap[v.name] = [];
						assigMap[v.name].push(v);
						return assigMap;
					},{});
					// try to determine if "if" references external param
					_compilerUtil.detectIfExternalRefs(nodeMap,refs);
					ref.assigMap = assigMap;
					ref.annot = {
						dataType:"item",
						occurs:3
					};
				} else {
					ref.annot = _Observable.Observable.from(ichildren).mergeMap(node => {
						const item = nodeMap.get(node);
						//if(param.node.parent.node.name == "typed") continue;
						item.analyze(nodeMap,modules,assigMap,shallow);
						// TODO check if contains item instead of atomic
						const annot = item.annot;
						if(annot){
							return isObservable(annot) ? annot : _Observable.Observable.of(annot);
						} else {
							throw new Error("Seq item has no annot "+item);
						}
					}).reduce((annot,cur) => {
						const dataType = annot.dataType, occurs = annot.occurs, curDataType = cur.dataType, curOccurs = cur.occurs;
						return {
							dataType: _compilerUtil.commonSubType(dataType,curDataType),
							occurs: _compilerUtil.commonOccurs(occurs,curOccurs)
						};
					});
				}
			} else {
				ref.annot = {
					dataType:"item",
					occurs:0
				};
			}
		} else if(type == VAR) {
			// NOTE too complex... maybe move to analyze...
			if(ref.node.count() > 1) {
				ref.isAssignment = true;
				const lastRef = nodeMap.get(ref.node.last());
				//console.log("lastRef:"+ref+" = "+lastRef);
				if(lastRef.type == VAR && lastRef.name == ref.name) ref.selfAssigment = true;
			} else if(typeof ref.name == "number") {
				ref.external = true;
				ref.isParam = true;
			} else {
				const parentRef = nodeMap.get(ref.node.parent.inode);
				const hasIfBranch = ref.hasIfBranch;
				if((parentRef && parentRef.type == VAR && parentRef.name == ref.name) ||
					(hasIfBranch && hasIfBranch.assignee && hasIfBranch.assignee.name == ref.name)) ref.selfAssigned = true;
			}
			if(ref.isAssignment){
				if(!assigMap[ref.name]) assigMap[ref.name] = [];
				assigMap[ref.name].push(ref);
				// retrieve this assigned node
				const last = nodeMap.get(ref.node.last());
				//console.log("detect annot from: "+ref+" to: "+last);
				if(!last.annot) throw new Error("Last "+last+" has no annot for "+ref);
				ref.annot = last.annot;
			} else if(!ref.isParam) {
				// try to get type info from constants in scope
				if(!ref.annot) {
					if(ref.node.__hasCall) {
						//console.log("has call: "+ref);
						ref.annot = {dataType:"item",occurs:3};
					} else {
						const { prefix, name } = _compilerUtil.prefixAndName(ref.name);
						if(prefix) {
							ref.isConstantRef = true;
							const constant = modules[prefix][name];
							if(constant && constant.annot) {
								ref.annot = constant.annot;
							} else {
								console.log("Constant " + ref.name+" not found or no annotation on constant");
							}
						} else {
							if(assigMap && assigMap[ref.name]) {
								const index = ref.index;
								const last = assigMap[ref.name].filter(x => x.index < index).last();
								ref.annot = last.annot;
								if(!ref.annot) console.log(ref+" no annot found in assigMap: "+last);
							} else {
								console.log(ref+" still no annot");
							}
						}
					}
				}
			}
		}
	}
	serialize(module) {
		//var ret = this.$ref.ref.map(x => x.serialize(module)).join(",");
		var ref = this.ref;
		var chained = this.type == 18;
		var type = ref.type;
		if(type == TYPESIG || type == TYPESEQ || type == TYPED) return "";
		if(type == EXPORT) return ";\n\n";
		// FIXME WHILE ref == chained
		var shiftRef = 0;
		while(type == 18) {
			shiftRef++;
			ref = ref.ref;
			type = ref.type;
		}
		var node = ref.node;
		if(!node) throw new Error(ref+" has no node");
		var ret = "";
		const hasIfBranch = ref.hasIfBranch;
		const isIfAssigned = hasIfBranch ? hasIfBranch.assignee : null;
		if(type == IF || type == AND || type == OR) {
			ret = "";
		} else if(type == THEN || type == ELSE) {
			return ref.ternary || ref.isElseIf ? "" : "}";
		} else if(type == VAR) {
			//console.log(this+"",ref+"", node.__hasCall, shiftRef);
			if(shiftRef || (!chained && node.__hasCall)) ret += ")";
			if(ref.ref.length > 1) ret += ")";
		} else if(type == CALL && /true|false/.test(node.name)) {
			ret = "";
		} else if(!(type == SEQ && ref.isLetRet && ref.isTop)) {
			ret =  ")";
		}
		if(!ref.hasAndOr && type != AND && type != OR && !chained && (ref.isIfTest || ref.isBoolean)) ret += ")";
		//console.log("closing: "+this,ref+"",ret);
		const parentCount = node.parent ? node.parent.count() : 0;
		// if followed by comment and that's the last node, use end sep
		// if comment is in the middle, use normal sep
		// comments don't write sep, so if multiple comments, no seps are added
		const sep = ref.infix == AND ? " && " : ref.infix == OR ? " || " :
			(ref.isIfTest || chained || ref.nextIsComment) ?
				"" :
				(hasIfBranch && !(hasIfBranch.ternary && hasIfBranch.isLetRet)) || (type == VAR && ref.isAssignment && (!hasIfBranch || !hasIfBranch.ternary)) ? ";\n" :
					",";
		// FIXME write to correct place and propagate down
		return ret + (node.indexInParent < parentCount || node.indexInParent < node.parent.callCount() ? sep : !chained && (isIfAssigned || ref.isReturn) ? "\n" : hasIfBranch && hasIfBranch.isLetRet && hasIfBranch.ternary ? ")" : "" ) + (chained ? ".call(null," : "");
	}
}

exports.Close = Close;
