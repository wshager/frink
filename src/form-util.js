import { ensureDoc } from "./doc";
import { iter } from "./access";

// iter form and replace fieldset types
export function process(node){
	iter.bind(this)(node,function(node){
		if(node.type == 6){
			// this is mutative
			if (node.inode.dataset.appearance == "hidden") {
				node.inode.disabled = true;
				node.inode.hidden = true;
			}
		}
	});
	return ensureDoc.bind(this)(node);
}
