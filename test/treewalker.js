const t = document.createTreeWalker(document.body);
const closers = new WeakMap();
const emit = (type,n) => {
	console.log(type,n);
};
const isBranch = n => n.nodeType == 1 || n.nodeType == 9 || n.nodeType == 10 || n.nodeType == 11;
const close = n => {
	emit("close",n);
	if(closers.has(n)) {
		const parent = closers.get(n);
		closers.delete(n);
		close(parent);
	}
};
emit("node",t.currentNode);
while(t.nextNode()) {
	const n = t.currentNode;
	emit("node",n);
	// if the node is a leaf or an empty branch, close its parent
	// else the node itself should close first
	// so don't close the parent yet, but move it to the closers map
	// and close it after this node closes
	let parent = n.parentNode;
	if(parent && parent.lastChild == n) {
		if(isBranch(n)) {
			if(!n.childNodes.length) {
				close(n);
				close(parent);
			} else {
				closers.set(n,parent);
			}
		} else {
			close(parent);
		}
	}
}
