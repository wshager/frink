import {
    createFormOrStructuredControl,
    mapKeyNormalizer,
    getValue as commonGetValue,
    setValue as commonSetValue,
} from "./structural-control-common.js";
import { set } from "./common.js";
import { register } from "./registry.js";

export const render = createFormOrStructuredControl.bind(null, "m");

export const getValue = commonGetValue.bind(null, {
    valueContainer: {},
    keyNormalizer: mapKeyNormalizer,
    appender: set
});

export const setValue = commonSetValue;

export default register("map-control", { render, getValue, setValue });
