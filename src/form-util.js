import { exactlyOne } from "./seq";
import { vdoc } from "./access";

// iter form and replace fieldset types
export function process($node){
	$node = exactlyOne($node);
	vdoc.bind(this)($node).forEach(node => {
		if(node.type == 6){
			// this is mutative
			if (node.inode.dataset.appearance == "hidden") {
				node.inode.disabled = true;
				node.inode.hidden = true;
			}
		}
	});
	return $node;
}
