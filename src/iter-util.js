export const foldLeft = (seed,fn) => a => {
	for(let x of a) {
		seed = fn(seed,x);
	}
	return seed;
};

export const forEach = fn => function*(a) {
	for(let x of a) yield(fn(x));
};

export const filter = fn => function*(a) {
	for(let x of a) {
		if(fn(x)) yield x;
	}
};
