import { elem } from "./dom-constr.js";

import { register } from "./registry.js";

export const render = ({ children, ...props }) => elem({
    $name: "input",
    type: "checkbox",
    dataset: {
        type: "b",
        appearance: "checkbox"
    },
    ...props,
    $children: children
});

export const getValue = elm => elm.checked;

export const setValue = (elm, val) => elm.checked = val;

export default register("boolean-input", { render, getValue, setValue });
