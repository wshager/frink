import { elem } from "./dom-constr.js";
import { register } from "./registry.js";

export const render = ({ children, ...props }) => elem({
    $name: "input",
    type: "number",
    dataset: {type: "n" },
    ...props,
    $children: children,
});

export const setValue = (elm, val) => elm.value = val;

export const getValue = (elm) => Number(elm.value);

export default register("number-input", { render, getValue, setValue });