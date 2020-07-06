import {
    createFormOrStructuredControl,
    getValue as commonGetValue,
    setValue as commonSetValue,
    mapKeyNormalizer,
} from "./structural-control-common.js";
import stringInput from "./string-input.js";
import typedControl from "./typed-control.js";
import listControl from "./list-control.js";
import { label } from "./label.js";
import { register } from "./registry.js";

export const render = ({name, children}) => {
    const nameControl = typedControl({
        appearance: label(stringInput),
        name: "$name",
    });
    const argsControl = typedControl({
        appearance: label(listControl),
        name: "$args",
        children,
    });
    return createFormOrStructuredControl("c", {
        name,
        children: [nameControl, argsControl]
    });
};

const callAppender = ({ $name, $args }, value, key) => (
    key === "$name"
        ? { $name: value, $args }
        : { $name, $args: value }
);

export const getValue = commonGetValue.bind(null, {
    valueContainer: {
        $name: void 0,
        $args: [],
    },
    keyNormalizer: mapKeyNormalizer,
    appender: callAppender,
});

export const setValue = commonSetValue;

export default register("call-control", { render, getValue, setValue });
