import {
    createFormOrStructuredControl,
    getValue as commonGetValue,
    setValue as commonSetValue,
    mapKeyNormalizer,
} from "./structural-control-common.js";
import stringInput from "./string-input.js";
import listControl from "./list-control.js";
import { label } from "./label.js";
import { register } from "./registry.js";
import { set } from "./common.js";

export const render = ({name, children}) => {
    const nameControl = label(stringInput({ name: "$name" }));
    const childrenControl = label(listControl({
        name: "$children",
        children,
    }));
    return createFormOrStructuredControl("e", {
        name,
        children: [nameControl, childrenControl]
    });
};

export const getValue = commonGetValue.bind(null, {
    valueContainer: {
        $name: void 0,
        $children: [],
    },
    keyNormalizer: mapKeyNormalizer,
    appender: set,
});

export const setValue = commonSetValue;

export default register("element-control", { render, getValue, setValue });
