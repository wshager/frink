import { replayable, of } from "./seq-common.js";
import { isUndef, identity } from "./common.js";
import { attr } from "./dom-constr.js";

const _getAttributeObserver = (target, name, subject) => {
    const config = { attributes: true, childList: false, subtree: false };
    const callback = function (mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === "attributes" && mutation.attributeName === name) {
                subject.next(mutation.target.getAttribute(name));
            }
        }
    };
    const observer = new MutationObserver(callback);
    return {
        observe: () => {
            observer.observe(target, config);
        }
    };
};

// TODO auto-convert each variable to Subject
export const bindAttribute = (target, name, subject = replayable()) => {
    //const value = target.getAttribute(name);
    // TODO detect bindable attributes
    const { observe } = _getAttributeObserver(target, name, subject);
    target.setAttributeNode(attr({ $name: name, $value: subject }));
    //subject.next(value);
    observe();
    return target;
};
export const on = (target, evtName, tx = identity, source = of(void 0)) => {
    const s = replayable();
    source.subscribe(val => {
        if (!isUndef(val)) s.next(val);
        target.addEventListener(evtName, evt => {
            s.next(tx(evt));
        });
    });
    return s;
};

export const replaceAttributeNode = (target, attrNode) => {
    target.setAttributeNode(attrNode);
    return target;
};
