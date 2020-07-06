import { elem } from "./dom-constr.js";
import { getValue as registryGetValue, setValue as registrySetValue } from "./registry.js";

export const structureTypes = ["f", "l", "m", "c", "e", "q", "r"];

const mapKeyRE = /\.(\w+)$/;
const listKeyRE = /\[([0-9]+)\]$/;

export const listKeyFormatter = (name, childKey) => `[${childKey}]`;
export const mapKeyFormatter = (name, childKey) => `${childKey}`;

export const getMapNameRoot = (name) => {
    return mapKeyRE.test(name)
        ? name.replace(mapKeyRE, ".")
        : "";
};

export const mapKeyNormalizer = name => {
    //if (!mapKeyRE.test(name)) {
    //    return name;
    //}
    return name;//.match(mapKeyRE)[1];
};
export const listKeyNormalizer = name => {
    if (!listKeyRE.test(name)) {
        return name;
    }
    return parseInt(name.match(listKeyRE)[1]);
};

export function createFormOrStructuredControl(l3Type, { name, children }) {
    const isForm = l3Type === "f";
    return elem({
        $name: isForm ? "form" : "fieldset",
        dataset: {
            type: isForm ? "m" : l3Type,
        },
        name,
        tabIndex: 0,
        autocomplete: "off",
        $children: children
    });
}

export const isParentOf = (elm, control) => {
    const { parentElement } = control;
    // return true when it's the parent
    if (parentElement.isSameNode(elm)) {
        return true;
    }
    // search for the closest ancestor of the control's parent
    const ancestor = parentElement.closest("fieldset, form", elm);
    return ancestor.isSameNode(elm);
};

export const getValue = ({
    valueContainer,
    keyNormalizer,
    appender
}, elm) => getControls(elm).reduce(
    (acc, control) => appender(acc, registryGetValue(control), keyNormalizer(control.name)),
    valueContainer
);

export const setValue = (elm, val) => {
    const isArray = Array.isArray(val);
    Object.entries(val).forEach(([k, v]) => {
        registrySetValue(getControlByName(elm, isArray ? `[${k}]` : k), v);
    });
    return val;
};

export const getControls = elm => Array.from(elm.elements)
    .filter(control => control.type !== "submit" && isParentOf(elm, control));

export const getControlByName = (elm, name) => {
    // FIXME restore name path
    const control = getControls(elm).find(({name: cName}) => cName === name);
    // either this is an array or a radiolist
    return control instanceof RadioNodeList
        ? control[0]
        : control;
};