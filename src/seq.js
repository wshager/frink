import { forEach$1, filter$1, forEach, filter, isIterable, _iterate } from "./transducers";

export function LazySeq(iterable){
	this.iterable = iterable;
}

LazySeq.prototype.filter = function(f){
	return new LazySeq(filter(this.iterable,f));
};

LazySeq.prototype.map = function(f){
	return new LazySeq(forEach(this.iterable,f));
};

LazySeq.prototype.get = function(index){
	var i = 0;
	var iterable = this.iterable;
	var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : {
		next:function(){
			return {value: iterable, done: true};
		}
	};
	var next = iter.next();
	this.iterable = [];
	while (!next.done) {
		var v = next.value;
		this.iterable.push(v);
		if(i===index) {
			this.rest = iter;
			return v;
		}
		next = iter.next();
	}
};

LazySeq.prototype.toString = function(){
	return "["+this.iterable+"]";
};
