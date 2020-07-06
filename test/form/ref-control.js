import {
    createFormOrStructuredControl,
    getValue as commonGetValue,
    setValue as commonSetValue,
    mapKeyNormalizer,
} from "./structural-control-common.js";
import stringInput from "./string-input.js";
import { label } from "./label.js";
import { register } from "./registry.js";
import { set } from "./common.js";

export const render = ({name}) => {
    const refControl = label(stringInput({ name: "$ref" }));
    return createFormOrStructuredControl("r", {
        name,
        children: [refControl]
    });
};

export const getValue = commonGetValue.bind(null, {
    valueContainer: {},
    keyNormalizer: mapKeyNormalizer,
    appender: set,
});

export const setValue = commonSetValue;

export default register("ref-control", { render, getValue, setValue });
