import { elem, text } from "./dom-constr.js";
import { getControls } from "./structural-control-common.js";
import { register } from "./registry.js";

export const render = ({ name, options, value, type = "s" }) => elem({
    $name: "fieldset",
    tabIndex: 0,
    name,
    dataset: {
        type,
        appearance: "radio-group"
    },
    $children: options.map(([k, v]) => elem({
        $name: "label",
        $children: [
            elem({
                $name: "input",
                type: "radio",
                name,
                value: k,
                checked: k === value
            }),
            text(`[${k}] ${v}`),
        ]
    }))
});

export const setValue = (elm , val)=> {
    const ret = getControls(elm).find(elm => elm.value === val);
    ret.checked = true;
    return val;
};
export const getValue = elm => {
    return getControls(elm).find(elm => elm.checked).value;
};

export default register("radio-input", { render, getValue, setValue });
