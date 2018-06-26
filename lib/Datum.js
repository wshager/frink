const normalizeName = require("./compiler-util").normalizeName;

class Datum {
	constructor(type,node,index) {
		this.$type = type;
		this.node = node;
		this.$index = index;
	}
	get index() {
		return this.$index;
	}
	get type() {
		return this.$type;
	}
	analyze(nodeMap) {
		if(this.annot) return;
		if(this.type == 8) {
			if(nodeMap) {
				const parentNode = this.node.parent;
				let prev = nodeMap.get(parentNode.previous(this.node));
				//const next = nodeMap.get(parentNode.next(this.node));
				if(prev instanceof Datum && prev.type == 8) {
					prev = prev.prev;
				}
				if(prev && this.node.indexInParent == parentNode.count()) prev.nextIsComment = true;
				this.prev = prev;
			}
			this.annot = {dataType:"item",occurs:1};
		} else if(this.type == 4) {
			// TODO fetch annotating
			this.annot = {dataType:"function",occurs:1};
		} else {
			this.annot = {dataType:typeof this.node.value,occurs:1};
		}
	}
	serialize(module) {
		let ret = "";
		const hasIfBranch = this.hasIfBranch;
		const isIfAssigned = hasIfBranch && !hasIfBranch.ternary ? hasIfBranch.assignee : null;
		if(isIfAssigned) {
			const { prefix, name } = normalizeName(isIfAssigned.name);
			ret = "$" + (prefix ? prefix + ":" : "") + name + " = ";
		} else if(this.isReturn) {
			ret = "return ";
		}
		if(this.type == 3) {
			ret += `"${this.node.value.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/&quot;/g,"\\\"").replace(/&apos;/,"'")}"`;
		} else if(this.type == 4) {
			const [qname,arity] = this.node.value.split(/#/);
			const { prefix,name } = normalizeName(qname,"fn");
			ret += prefix + "." + name;
		} else if(this.type == 12) {
			ret += this.node.value+"";
		} else if(this.type == 8) {
			ret = "/*" + this.node.value + "*/\n";
			return ret;
		}
		const sep = this.nextIsComment ? "" : ",";
		return ret + (this.node.indexInParent < this.node.parent.count() ? sep : isIfAssigned || this.isReturn ? ";\n" : "");
	}
	toString() {
		return `Datum[${this.type},${this.index},${this.node.value}]`;
	}
}

exports.Datum = Datum;
