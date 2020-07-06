import {
    createFormOrStructuredControl,
    getValue as commonGetValue,
    setValue as commonSetValue
} from "./structural-control-common.js";
import { identity, set } from "./common.js";
import { register } from "./registry.js";

export const render = createFormOrStructuredControl.bind(null, "f");

export const getValue = commonGetValue.bind(null, {
    valueContainer: {},
    keyNormalizer: identity,
    appender: set
});

export const setValue = commonSetValue;

export default register("form", { render, getValue, setValue });
