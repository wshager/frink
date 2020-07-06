import { elem } from "./dom-constr.js";
import { register } from "./registry.js";

export const render = ({ children, ...props }) => elem({
    $name: "input",
    dataset: { type: "s" },
    ...props,
    $children: children
});
export const getValue = elm => elm.value;
export const setValue = (elm, val) => elm.value = val;

export default register("string-input", { render, getValue, setValue });
