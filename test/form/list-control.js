import {
    createFormOrStructuredControl,
    getValue as commonGetValue,
    setValue as commonSetValue,
    listKeyNormalizer,
} from "./structural-control-common.js";
import { insert } from "./common.js";
import { register } from "./registry.js";

export const render = createFormOrStructuredControl.bind(null, "l");

export const getValue = commonGetValue.bind(null, {
    valueContainer: [],
    keyNormalizer: listKeyNormalizer,
    appender: insert,
});

export const setValue = commonSetValue;

export default register("list-control", { render, getValue, setValue });
