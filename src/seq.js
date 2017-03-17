export function LazySeq(iterable){
	this.iterable = iterable || [];
}

LazySeq.prototype.push = function (v) {
	return this.concat(v);
};

// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@append"] = LazySeq.prototype.push;


LazySeq.prototype.concat = function (...v) {
	return new LazySeq(this.iterable.concat(v));
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
