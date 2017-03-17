import { iter, nextNode } from "./access";
import { nodesList } from "./dom";

function same(node,vnode){
	if(node === vnode) return true;
	if(node === undefined || vnode === undefined) return false;
	var inode = vnode.inode;
	if(node.nodeType !== vnode.type) return false;
	if(node["@@doc-depth"] !== inode._depth) return false;
	if(node.nodeValue !== null) {
		if(node.nodeValue !== vnode.value) return false;
	} else if(node.nodeName !== (inode._name+'').toUpperCase()) return false;
	return true;
}

export function render(vnode, root) {
	// fixme stateless
	var parents = [{ domNode: root }];
	const attrFunc = (domNode, v, k) => (domNode.setAttribute(k, v), domNode);
	// ensure paths by calling iter
	var domNodes = nodesList(root);
	var i = 0;
	var skipDepth = 0, append = false, nextSame = false;
	var handleNode = function (node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		var type = node.type,
		    inode = node.inode,
		    domNode = node.domNode,
		    cur = domNodes[i],
			next = domNodes[i+1],
			nn = nextNode(node);
		var curSame = nextSame || same(cur, node);
		nextSame = same(next,nn);
		if (cur && curSame && nextSame) {
			// skip until next
			// console.log("same",cur,cur["@@doc-depth"],node.name,inode._depth);
			node.domNode = cur;
			skipDepth = cur["@@doc-depth"];
			if (type == 1) parents[inode._depth] = node;
		} else {
			if (cur) {
				if (cur["@@doc-depth"] == inode._depth - 1) {
					//console.log("append",cur);
					append = true;
				} else if (cur["@@doc-depth"] == inode._depth + 1) {
					// console.log("remove",cur);
					// don't remove text, it will be garbage collected
					if (cur.nodeType == 1) cur.parentNode.removeChild(cur);
					// remove from dom, retry this node
					// keep node untill everything is removed
					i++;
					return handleNode(node);
				} else {
					if(type == 1){
						if (cur.nodeType != 17) cur.parentNode.removeChild(cur);
						// remove from dom, retry this node
						i++;
						return handleNode(node);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if(cur["@@doc-depth"] == skipDepth + 1){
							cur.nodeValue = node.value;
						} else {
							append = true;
						}
					}
				}
			}
			if(!cur || append){
				//console.log("empty",type, append)
				if (type == 1) {
					domNode = document.createElement(node.name);
					if (parents[inode._depth - 1]) parents[inode._depth - 1].domNode.appendChild(domNode);
					inode._attrs.reduce(attrFunc, domNode);
					parents[inode._depth] = node;
				} else if (type == 3) {
					domNode = document.createTextNode(node.value);
					parents[inode._depth - 1].domNode.appendChild(domNode);
				}
				node.domNode = domNode;
			}
		}
		if(!append) {
			i++;
		} else {
			append = false;
		}
	};
	iter(vnode, handleNode);
	var l = domNodes.length;
	for (; --l >= i;) {
		var node = domNodes[l];
		if (node.nodeType == 1) node.parentNode.removeChild(node);
	}
}

function createProjection(vnode, projectionOptions = {}) {
	return {
		update: function(updatedVnode) {
			if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
				throw new Error('The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)');
			}
			updateDom(vnode, updatedVnode, projectionOptions);
			vnode = updatedVnode;
		},
		domNode: vnode._domNode
	};
}

function updateDom(previous, vnode, projectionOptions) {
	let domNode = previous.domNode;
	let textUpdated = false;
	if (previous === vnode) {
		return false;
	}
}

function updateDom2(previous, vnode, projectionOptions) {
	let domNode = previous.domNode;
	let textUpdated = false;
	if (previous === vnode) {
		return false; // By contract, VNode objects may not be modified anymore after passing them to maquette
	}
	let updated = false;
	if (vnode.type == 3) {
		if (vnode.value !== previous.value) {
			let newVNode = document.createTextNode(vnode.value);
			domNode.parentNode.replaceChild(newVNode, domNode);
			vnode.domNode = newVNode;
			textUpdated = true;
			return textUpdated;
		}
	} else {
		// FIXME what type?
		if (vnode.vnodeSelector.lastIndexOf('svg', 0) === 0) { // lastIndexOf(needle,0)===0 means StartsWith
			//projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
		}
		if (previous.value !== vnode.value) {
			updated = true;
			if (vnode.value === undefined) {
				domNode.removeChild(domNode.firstChild); // the only textnode presumably
			} else {
				domNode.textContent = vnode.value;
			}
		}
		// FIXME recursion!
		updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions) || updated;
		updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
		if (vnode.properties && vnode.properties.afterUpdate) {
			vnode.properties.afterUpdate.apply(vnode.properties.bind || vnode.properties, [domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]);
		}
	}
	if (updated && vnode.properties && vnode.properties.updateAnimation) {
		//vnode.properties.updateAnimation(domNode, vnode.properties, previous.properties);
	}
	vnode.domNode = previous.domNode;
	return textUpdated;
}

function updateChildren(vnode, domNode, oldChildren, newChildren, projectionOptions) {
	if (oldChildren === newChildren) {
		return false;
	}
	oldChildren = oldChildren || emptyArray;
	newChildren = newChildren || emptyArray;
	let oldChildrenLength = oldChildren.length;
	let newChildrenLength = newChildren.length;
	let transitions = projectionOptions.transitions;

	let oldIndex = 0;
	let newIndex = 0;
	let i;
	let textUpdated = false;
	while (newIndex < newChildrenLength) {
		let oldChild = (oldIndex < oldChildrenLength) ? oldChildren[oldIndex] : undefined;
		let newChild = newChildren[newIndex];
		if (oldChild !== undefined && same(oldChild, newChild)) {
			// FIXME recursion!
			// same node, so... what? update text just in case?
			textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
			oldIndex++;
		} else {
			let findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
			if (findOldIndex >= 0) {
				// Remove preceding missing children
				for (i = oldIndex; i < findOldIndex; i++) {
					nodeToRemove(oldChildren[i], transitions);
					checkDistinguishable(oldChildren, i, vnode, 'removed');
				}
				// FIXME recusion!
				textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
				oldIndex = findOldIndex + 1;
			} else {
				// New child
				createDom(newChild, domNode, (oldIndex < oldChildrenLength) ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
				nodeAdded(newChild, transitions);
				checkDistinguishable(newChildren, newIndex, vnode, 'added');
			}
		}
		newIndex++;
	}
	if (oldChildrenLength > oldIndex) {
		// Remove child fragments
		for (i = oldIndex; i < oldChildrenLength; i++) {
			nodeToRemove(oldChildren[i], transitions);
			checkDistinguishable(oldChildren, i, vnode, 'removed');
		}
	}
	return textUpdated;
}

function updateProperties(domNode, previousProperties, properties, projectionOptions) {
 if (!properties) {
   return;
 }
 let propertiesUpdated = false;
 let propNames = Object.keys(properties);
 let propCount = propNames.length;
 for (let i = 0; i < propCount; i++) {
   let propName = propNames[i];
   // assuming that properties will be nullified instead of missing is by design
   let propValue = properties[propName];
   let previousValue = previousProperties[propName];
   if (propName === 'class') {
	 if (previousValue !== propValue) {
	   throw new Error('"class" property may not be updated. Use the "classes" property for conditional css classes.');
	 }
   } else if (propName === 'classes') {
	 let classList = domNode.classList;
	 let classNames = Object.keys(propValue);
	 let classNameCount = classNames.length;
	 for (let j = 0; j < classNameCount; j++) {
	   let className = classNames[j];
	   let on = !!propValue[className];
	   let previousOn = !!previousValue[className];
	   if (on === previousOn) {
		 continue;
	   }
	   propertiesUpdated = true;
	   if (on) {
		 classList.add(className);
	   } else {
		 classList.remove(className);
	   }
	 }
   } else if (propName === 'styles') {
	 let styleNames = Object.keys(propValue);
	 let styleCount = styleNames.length;
	 for (let j = 0; j < styleCount; j++) {
	   let styleName = styleNames[j];
	   let newStyleValue = propValue[styleName];
	   let oldStyleValue = previousValue[styleName];
	   if (newStyleValue === oldStyleValue) {
		 continue;
	   }
	   propertiesUpdated = true;
	   if (newStyleValue) {
		 checkStyleValue(newStyleValue);
		 projectionOptions.styleApplyer(domNode, styleName, newStyleValue);
	   } else {
		 projectionOptions.styleApplyer(domNode, styleName, '');
	   }
	 }
   } else {
	 if (!propValue && typeof previousValue === 'string') {
	   propValue = '';
	 }
	 if (propName === 'value') { // value can be manipulated by the user directly and using event.preventDefault() is not an option
	   if ((domNode)[propName] !== propValue && (domNode)['oninput-value'] && (domNode)['oninput-value'] !== propValue) {
		 (domNode)[propName] = propValue; // Reset the value, even if the virtual DOM did not change
		 (domNode)['oninput-value'] = undefined;
	   } // else do not update the domNode, otherwise the cursor position would be changed
	   if (propValue !== previousValue) {
		 propertiesUpdated = true;
	   }
	 } else if (propValue !== previousValue) {
	   let type = typeof propValue;
	   if (type === 'function') {
		 throw new Error('Functions may not be updated on subsequent renders (property: ' + propName +
		   '). Hint: declare event handler functions outside the render() function.');
	   }
	   if (type === 'string' && propName !== 'innerHTML') {
		 if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
		   (domNode).setAttributeNS(NAMESPACE_XLINK, propName, propValue);
		 } else if (propName === 'role' && propValue === '') {
			 (domNode).removeAttribute(propName);
		 } else {
		   (domNode).setAttribute(propName, propValue);
		 }
	   } else {
		 if ((domNode)[propName] !== propValue) { // Comparison is here for side-effects in Edge with scrollLeft and scrollTop
		   (domNode)[propName] = propValue;
		 }
	   }
	   propertiesUpdated = true;
	 }
   }
 }
 return propertiesUpdated;
}

function createDom(vnode, parentNode, insertBefore, projectionOptions){
	let domNode, i, c, start = 0, type, found;
	let vnodeSelector = vnode.vnodeSelector;
	if (vnodeSelector === '') {
		domNode = vnode.domNode = document.createTextNode(vnode.text);
		if (insertBefore !== undefined) {
			parentNode.insertBefore(domNode, insertBefore);
		} else {
			parentNode.appendChild(domNode);
		}
	} else {
		// parse selector
		for (i = 0; i <= vnodeSelector.length; ++i) {
			c = vnodeSelector.charAt(i);
			// if EOS or selector found
			if (i === vnodeSelector.length || c === '.' || c === '#') {
				type = vnodeSelector.charAt(start - 1);
				found = vnodeSelector.slice(start, i);
				if (type === '.') {
					domNode.classList.add(found);
				} else if (type === '#') {
					domNode.id = found;
				} else {
					if (found === 'svg') {
						projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
					}
					if (projectionOptions.namespace !== undefined) {
						domNode = vnode.domNode = document.createElementNS(projectionOptions.namespace, found);
					} else {
						domNode = vnode.domNode = document.createElement(found);
						if (found === 'input' && vnode.properties && vnode.properties.type !== undefined) {
							// IE8 and older don't support setting input type after the DOM Node has been added to the document
							domNode.setAttribute("type", vnode.properties.type);
						}
					}
					if (insertBefore !== undefined) {
						parentNode.insertBefore(domNode, insertBefore);
					} else {
						parentNode.appendChild(domNode);
					}
				}
				start = i + 1;
			}
		}
		initPropertiesAndChildren(domNode, vnode, projectionOptions);
	}
}

function initPropertiesAndChildren(domNode, vnode, projectionOptions) {
  addChildren(domNode, vnode.children, projectionOptions); // children before properties, needed for value property of <select>.
  if (vnode.text) {
    domNode.textContent = vnode.text;
  }
  setProperties(domNode, vnode.properties, projectionOptions);
  if (vnode.properties && vnode.properties.afterCreate) {
    vnode.properties.afterCreate.apply(vnode.properties.bind || vnode.properties, [domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]);
  }
}

function addChildren(domNode, children, projectionOptions) {
  if (!children) {
    return;
  }
  for (let i = 0; i < children.length; i++) {
    createDom(children[i], domNode, undefined, projectionOptions);
  }
}

function setProperties(domNode, properties, projectionOptions) {
  if (!properties) {
    return;
  }
  let eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
  let propNames = Object.keys(properties);
  let propCount = propNames.length;
  for (let i = 0; i < propCount; i++) {
    let propName = propNames[i];
    let propValue = properties[propName];
    if (propName === 'className') {
      throw new Error('Property "className" is not supported, use "class".');
    } else if (propName === 'class') {
      (propValue).split(/\s+/).forEach(token => (domNode).classList.add(token));
    } else if (propName === 'classes') {
      // object with string keys and boolean values
      let classNames = Object.keys(propValue);
      let classNameCount = classNames.length;
      for (let j = 0; j < classNameCount; j++) {
        let className = classNames[j];
        if (propValue[className]) {
          (domNode).classList.add(className);
        }
      }
    } else if (propName === 'styles') {
      // object with string keys and string (!) values
      let styleNames = Object.keys(propValue);
      let styleCount = styleNames.length;
      for (let j = 0; j < styleCount; j++) {
        let styleName = styleNames[j];
        let styleValue = propValue[styleName];
        if (styleValue) {
          checkStyleValue(styleValue);
          projectionOptions.styleApplyer(domNode, styleName, styleValue);
        }
      }
    } else if (propName !== 'key' && propValue !== null && propValue !== undefined) {
      let type = typeof propValue;
      if (type === 'function') {
        if (propName.lastIndexOf('on', 0) === 0) { // lastIndexOf(,0)===0 -> startsWith
          if (eventHandlerInterceptor) {
            propValue = eventHandlerInterceptor(propName, propValue, domNode, properties); // intercept eventhandlers
          }
          if (propName === 'oninput') {
            (function() {
              // record the evt.target.value, because IE and Edge sometimes do a requestAnimationFrame between changing value and running oninput
              let oldPropValue = propValue;
              propValue = function(_this /*HTMLElement*/, evt /*Event*/) {
                (evt.target)['oninput-value'] = (evt.target /*as HTMLInputElement*/).value; // may be HTMLTextAreaElement as well
                oldPropValue.apply(_this, [evt]);
              };
		  	})();
          }
          (domNode)[propName] = propValue;
        }
      } else if (type === 'string' && propName !== 'value' && propName !== 'innerHTML') {
        if (projectionOptions.namespace === NAMESPACE_SVG && propName === 'href') {
          (domNode).setAttributeNS(NAMESPACE_XLINK, propName, propValue);
        } else {
          (domNode).setAttribute(propName, propValue);
        }
      } else {
        (domNode)[propName] = propValue;
      }
    }
  }
}


function nodeToRemove(vNode, transitions) {
  let domNode = vNode.domNode;
  if (vNode.properties) {
    let exitAnimation = vNode.properties.exitAnimation;
    if (exitAnimation) {
      (domNode).style.pointerEvents = 'none';
      let removeDomNode = function() {
        if (domNode.parentNode) {
          domNode.parentNode.removeChild(domNode);
        }
      };
      if (typeof exitAnimation === 'function') {
        exitAnimation(domNode, removeDomNode, vNode.properties);
        return;
      } else {
        transitions.exit(vNode.domNode, vNode.properties, exitAnimation, removeDomNode);
        return;
      }
    }
  }
  if (domNode.parentNode) {
    domNode.parentNode.removeChild(domNode);
  }
}
