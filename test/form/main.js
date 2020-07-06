// TODO create custom form + controls
// This is a *very* crude prototype of the core form

// the intention is not to create a wrapper so we can in inspect it in the DOM
// it's to provide the capabilities that we need
// the problem is, we can't add CE wrapper on CE wrapper on CE wrapper
// instead it should take function upon function upon function and apply that to the wrapped control
// this would be the placeholder for that: DOM Type Classes...
// label -> Labelable -> Labeled
// Labeled can't be an argument for `label`
// any other wrappers are prefereably native DOM
// functions should be used to wrap a control with functionality (capabilities)
// not classes, because it will bite us in the end
// TODO when type() is called add data-type attr and validation/coercion
// TODO use EditableText with event (no form value)
// label may be in light DOM, but events are hidden
// label receives events and progates name to child
// how this should work...
/**
 * component emits change
 * change is stored in a local variable (Rx Subject)
 * function passes var to child
 * let $name := $child/!@name (: this is a live attribute! :)
 * let $label-text := <span content-editable="{true()}">{$name}</span> (: component knows it should re-render, because $name is live :)
 * let $updated-name := on($label-text, 'input', ($evt) => mapName($evt/target/text-content))
 * let $bound-child := <{...$child} name="{$updated-name}"/> (: spread into empty element does something like
 * elem($child/local-name, ($child/*[not(./local-name eq 'name', attr($updated-name))))
 *  :)
 * return <label>{$label-text, $bound-child}</label>
 */
// TODO use L3 DOM
// The intent is NOT to use web components, but only the 'is' attribute
// so that this form can be rendered on a server *and still work* (numbers and booleans should still be cast)
// The interactive tree will be translated, and simply contains l3 elements
// Any attributes may be provided as any data structure, so it would be possible to
// e.g. provide a enum constraint of an element as a list
// TODO
// AST-generating and manipilating functions
// Any function may return an instance of Runnable, which is an AST
// Free manipulation is not a good idea probably, but restructuring children seems OK
// But we need to enforce type constraints (of children) in each transformation
// So if we change one function call into another it must ba a valid call (in it's context)
// The result of running the AST shuold be the same as if it were called without virtuals
import { pipe, forEach, seq, replayable } from "./seq-common.js";
import stringInput from "./string-input.js";
import numberInput from "./number-input.js";
import booleanInput from "./boolean-input.js";
import form from "./form.js";
import mapControl from "./map-control.js";
import listControl from "./list-control.js";
import callControl from "./call-control.js";
import elementControl from "./element-control.js";
import refControl from "./ref-control.js";
import radioGroup from "./radio-group.js";
import { typedControl } from "./typed-control.js";
import { label } from "./label.js";
import { labelEditable } from "./label-editable.js";
import { replaceAttributeNode, on } from "./bindings.js";
/*
const labelEditable = (v) => {
    console.log(v);
    const vlabel = vLabelEditable(v);
    console.log(vlabel);
    const ret = run(vlabel);
    ret.subscribe(console.log);
    return ret;
};

*/
/*
{
    $args: [
        {
            $name: "concat",
            $args: [
                {
                    $name: "$",
                    $args: [
                        "name-root"
                    ]
                },
                {
                    $name: "get",
                    $args: [
                        {
                            $name: "$",
                            $args: [
                                1
                            ]
                        },
                        {
                            $name: "json-path-to-array",
                            $args: [
                                "target.textContent"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
*/

import {
    mapKeyFormatter,
    listKeyFormatter,
    //callKeyFormatter,
    //elementKeyFormatter,
    //quotationKeyFormatter,
    mapKeyNormalizer,
    listKeyNormalizer,
    //callKeyNormalizer,
    //elementKeyNormalizer,
    //quotationKeyNormalizer,
    getControls,
    getControlByName,
    structureTypes,
    getMapNameRoot
} from "./structural-control-common.js";
import { getValue, setValue } from "./registry.js";
import { elem, attr, text } from "./dom-constr.js";
import { identity, hasOwnProp } from "./common.js";

const mainL3 = {
    $name: "form",
    $args: [
        {
            name: "main",
            children: [
                {
                    $name: "typed-control",
                    $args: [
                        {
                            appearance: {
                                $name: "label-editable",
                                $args: [
                                    {
                                        $ref: "string-input"
                                    }
                                ]
                            },
                            name: "field1"
                        }
                    ]
                }
            ]
        }
    ]
};

const nodeMap = new WeakMap();

const KEY_BACKSLASH = 220;
const KEY_ENTER = 13;
const KEY_DELETE = 46;
const KEY_TAB = 9;
const KEY_ESCAPE = 27;

const typeMap = {
    s: "String",
    n: "Number",
    b: "Boolean",
    l: "List",
    m: "Map",
    c: "Call function",
    q: "Quotation",
    e: "Element",
    "-": "Delete",
    ",": "Add"
};

const coreL3 = {
    $name: "form",
    $args: [
        {
            name: "core",
            children: [
                {
                    $name: "typed-control",
                    $args: [
                        {
                            appearance: {
                                $name: "label",
                                $args: [{ $ref: "boolean-input" }]
                            },
                            name: "active"
                        }
                    ]
                },
                {
                    $name: "typed-control",
                    $args: [
                        {
                            appearance: {
                                $name: "label",
                                $args: [{ $ref: "radio-group" }]
                            },
                            name: "type",
                            options: Object.entries(typeMap),
                            value: "s",
                            legend: true
                        }
                    ]
                }
            ]
        }
    ]
};

// const wrapLogger = (fn, name) => (...args) => {
// 	const ret = fn(...args);
// 	console.log("calling", fn.name || name, "args", args, "ret", ret);
// 	return ret;
// };

const atomicInputTypeMap = {
    s: "string-input",
    n: "number-input",
    b: "boolean-input"
};

const keyFormatterMap = {
    l: listKeyFormatter,
    m: mapKeyFormatter,
    e: listKeyFormatter,
    c: listKeyFormatter
    //q: quotationKeyFormatter
};

const keyNormalizerMap = {
    l: listKeyNormalizer,
    m: mapKeyNormalizer,
    e: listKeyNormalizer,
    c: listKeyNormalizer
    //q: quotationKeyNormalizer
};

var l3Constructors = {
    f: "form",
    l: "list-control",
    m: "map-control",
    c: "call-control",
    q: "quotation-control",
    e: "element-control",
    a: "attribute-control",
    r: "ref-control"
};

const inferL3Type = o => {
    const type = typeof o;
    return type === "object"
        ? Array.isArray(o)
            ? "l"
            : hasOwnProp("$ref", o)
                ? "r"
                : hasOwnProp("$name", o)
                    ? hasOwnProp("$args", o)
                        ? "c"
                        : hasOwnProp("$children", o)
                            ? "e"
                            : hasOwnProp("$value", o)
                                ? "a"
                                : "m"
                    : hasOwnProp("$args", o)
                        ? "q"
                        : "m"
        : "x";
};

const vars = {};
function $(name, body) {
    if (body) {
        vars[name] = run(body);
        return { $name: "", $args: [] };
    }
    return vars[name];
}

function camelCase(str) {
    return str
        .split(/-/g)
        .map((_, i) => (i > 0 ? _.charAt(0).toUpperCase() + _.substr(1) : _))
        .join("");
}
const getRef = ref => (ref === "" ? seq : eval(camelCase(ref)));
const setChildren = (arg, children) => {
    //const l3Type = arg.$type;
    switch (inferL3Type(arg)) {
        case "c":
            return { ...arg, $args: children };
        case "e":
            return { ...arg, $children: children };
        case "l":
            return children;
        case "m":
            return children.reduce(
                (acc, { $key, $value }) => ({ ...acc, [$key]: $value }),
                {}
            );
        case "a":
            return { ...arg, $value: children[0] };
        default:
            return arg;
    }
};

// TODO describe as Runnable itself
const run = arg => {
    const stack = [];
    const argStack = [];
    const append = arg => {
        const isMapEntry = hasOwnProp("$key", arg);
        let key;
        if (isMapEntry) {
            key = arg.$key;
            arg = arg.$value;
        }
        const l3Type = inferL3Type(arg);
        // first get the ref
        let func = getFunc(arg, l3Type);
        // check for assignment
        // FIXME types
        if (l3Type === "c" && arg.$name === "$" && arg.$args.length > 1) {
            arg = func(arg);
            func = getFunc(arg, l3Type);
        }
        // then push it
        stack.push(func);
        //arg.$type = l3Type;
        stack.push(isMapEntry ? { $key: key, $value: arg } : arg);
        // then consider children
        const children = getChildren(arg);
        children.forEach(child => {
            append(child);
        });
    };
    append(arg);
    // eval stack
    let i = stack.length;
    while (i > 0) {
        let arg = stack.pop();
        const isMapEntry = hasOwnProp("$key", arg);
        let key;
        if (isMapEntry) {
            key = arg.$key;
            arg = arg.$value;
        }
        //delete arg.$type;
        const f = stack.pop();
        const children = getChildren(arg);
        const args = argStack.splice(0, children.length);
        const newArg = setChildren(arg, args);
        let ret = f(newArg);
        if (isMapEntry) {
            ret = { $key: key, $value: ret };
        }
        if (typeof ret === "object" && ret instanceof Node) {
            nodeMap.set(ret, arg);
        }
        argStack.unshift(ret);
        i -= 2;
    }
    return argStack[0];
};
const getFunc = (arg, l3Type) => {
    switch (l3Type || inferL3Type(arg)) {
        case "c":
            return ({ $name, $args }) => getRef($name)(...$args);
        case "e":
            return elem;
        case "a":
            return attr;
        case "x":
            return identity;
        case "r":
            return ({ $ref }) => getRef($ref);
        case "l":
            return identity;
        case "m":
            return identity;
        default:
            throw new Error("Unknown type");
    }
};

const getChildren = (arg, l3Type) => {
    switch (l3Type || inferL3Type(arg)) {
        case "c":
            return arg.$args; //.map(($value, $key) => ({ $key, $value }));
        case "e":
            return arg.$children; //.map(($value, $key) => ({ $key, $value }));
        case "a":
            return [arg.$value];
        case "x":
            return [];
        case "r":
            return [];
        case "l":
            return arg; //.map(($value, $key) => ({ $key, $value }));
        case "m":
            return Object.entries(arg).map(([$key, $value]) => ({ $key, $value }));
        default:
            throw new Error("Unknown type");
    }
};

const appearance = (arg, l3Type, name) => {
    const $ref =
    l3Type === "x"
        ? atomicInputTypeMap[inferPrimitiveType(arg)]
        : l3Constructors[l3Type];
    return typeof name === "string"
        ? {
            $name: "label-editable",
            $args: [{ $ref }]
        }
        : { $ref };
};

const childrenMap = {
    l: (arg, parentName) =>
        arg.map((child, name) =>
            createFragment(child, listKeyFormatter(parentName, name), "l")
        ),
    m: (arg, parentName) =>
        Object.entries(arg).map(([name, child]) =>
            createFragment(child, mapKeyFormatter(parentName, name), "m")
        ),
    c: (arg, parentName) =>
        arg.$args.map((child, name) =>
            createFragment(child, listKeyFormatter(parentName, name), "c")
        ),
    e: (arg, parentName) =>
        arg.$children.map((child, name) =>
            createFragment(child, listKeyFormatter(parentName, name), "e")
        ),
    x: () => {},
    r: () => {}
};

const inferChildren = (arg, l3Type, name) => {
    const children = childrenMap[l3Type](arg, name);
    return children ? { name, children } : { name };
};

const inferPrimitiveType = arg => (typeof arg)[0];

// TODO move to `setArbitraryValue`
const createFragment = (arg, name, parentL3Type) => {
    const l3Type = inferL3Type(arg);
    return {
        $name: "typed-control",
        $args: [
            {
                appearance: appearance(
                    arg,
                    l3Type,
                    keyNormalizerMap[parentL3Type](name)
                ),
                ...inferChildren(arg, l3Type, name),
                legend: l3Type !== "x"
            }
        ]
    };
};

function getL3TypeOrDataType(elm) {
    return elm.dataset.type;
}

function load(tree) {
    // provided the values are loaded in the tree we can clear it
    //form.remove();
    // create meta-structure
    const fragment = {
        $name: "form",
        $args: [
            {
                name: "meta",
                children: [createFragment(tree, "main", "m")]
            }
        ]
    };
    return run(fragment);
}

//TODO store path in core form
const jumpState = { selected: void 0 };
window.onload = () => {
    let main = run(mainL3);
    const core = run(coreL3);
    function coreChangeHandler(evt) {
        if (evt.target.name === "active") {
            // if this was triggered by inactivating
            if (jumpState.selected) {
                coreBlurHandler();
            }
        } else {
            evt.preventDefault();
            setValue(core, {
                ...getValue(core),
                active: false
            });
            const { selected } = jumpState;
            cleanCore();
            emitCoreChange(getValue(core), selected);
        }
    }

    function cleanCore() {
        core.style.display = "none";
        core.removeEventListener("keydown", coreKeyDownHandler);
        core.removeEventListener("change", coreChangeHandler);
        //core.removeEventListener("focusout", coreBlurHandler);
        //core.removeEventListener("submit", coreSubmitHandler);
        main.addEventListener("keydown", mainKeyDownHandler);
        const { selected } = jumpState;
        if (selected) {
            selected.focus();
            jumpState.selected = void 0;
        }
    }
    function coreBlurHandler() {
        setValue(core, {
            type: getL3TypeOrDataType(jumpState.selected),
            active: false
        });
        cleanCore();
    }
    function coreKeyDownHandler(evt) {
        const code = evt.keyCode;
        console.log("coreKeyDownHandler", code);
        const isEnter = code === KEY_ENTER;
        const isCancelKey =
      code === KEY_ESCAPE || code === KEY_TAB || code === KEY_BACKSLASH;
        if (isCancelKey || isEnter) {
            if (isEnter) {
                coreChangeHandler(evt);
            } else {
                coreBlurHandler(evt);
            }
        } else {
            const isDelete = code === KEY_DELETE;
            const key = isDelete ? "-" : evt.key;
            const typeControl = getControlByName(this, "type");
            if (typeMap[key]) {
                setValue(typeControl, key);
                // update immediately
                coreChangeHandler(evt);
            }
        }
    }
    function mainKeyDownHandler(evt) {
        const state = captureBackSlash(evt.keyCode, getValue(core));
        const selected = document.activeElement;
        if (state.active) {
            evt.preventDefault();
            jumpState.selected = selected;
            // TODO infer type from control (until we have custom controls)
            const type = getL3TypeOrDataType(selected);
            const typeControl = getControlByName(core, "type");
            setValue(core, {
                active: true,
                type
            });
            core.style.display = "block";
            core.style.top = selected.offsetTop - 40 + "px";
            typeControl.focus();
            main.removeEventListener("keydown", mainKeyDownHandler);
            //core.addEventListener("focusout", coreBlurHandler);
            //core.addEventListener("submit", coreSubmitHandler);
            core.addEventListener("change", coreChangeHandler);
            core.addEventListener("keydown", coreKeyDownHandler);
        }
    }
    function mainInputHandler(evt) {
        const { target } = evt;
        const control = target.closest("typed-control");
        const ref = findByRef(control);
        if (ref) {
            // TODO distinguish differently
            if (target.matches(".label-text")) {
                const { textContent: name } = target;
                ref.$args[1] = { ...ref.$args[1], name };
            } else {
                const { value } = target;
                ref.$args[1] = { ...ref.$args[1], value };
            }
        }
        document.getElementById("result").textContent = JSON.stringify(
            getValue(this),
            null,
            4
        );
    }
    main.addEventListener("keydown", mainKeyDownHandler);
    main.addEventListener("input", mainInputHandler);
    const mountpoint = document.getElementById("mountpoint");
    mountpoint.appendChild(main);
    mountpoint.appendChild(core);
    const lbl = replayable("Edit");
    let toggled = false;
    let metaform;
    elem(
        {
            $name: "button",
            onclick: () => {
                if (!toggled) {
                    toggled = true;
                    main.remove();
                    lbl.next("Render");
                    metaform = load(mainL3);
                    mountpoint.insertBefore(metaform, core);
                    setValue(metaform, { main: mainL3 });
                    metaform.addEventListener("input", function() {
                        const val = getValue(this);
                        const { main } = val;
                        mainL3.$args = main.$args;
                        document.getElementById("result").textContent = JSON.stringify(
                            val,
                            null,
                            4
                        );
                    });
                } else {
                    toggled = false;
                    lbl.next("Edit");
                    metaform.remove();
                    main = run(mainL3);
                    mountpoint.insertBefore(main, core);
                    main.addEventListener("keydown", mainKeyDownHandler);
                    main.addEventListener("input", mainInputHandler);
                }
            },
            $children: [text(lbl)]
        },
        mountpoint,
        main
    );
    getControls(main)[0].focus();
};

const captureBackSlash = (code, state) => {
    const isBackSlash = code === KEY_BACKSLASH;
    if (isBackSlash) {
        state.active = true;
    }
    return state;
};

function insertChildControl(selected, parent) {
    const parentType = getL3TypeOrDataType(parent);
    if (parentType === "m") {
        parent.controlCount = getControls(parent).length;
    }
    const key =
    parentType === "m"
        ? "field" + ++parent.controlCount
        : getControls(parent).length; // FIXME rename all children
    const name = parent.isSameNode(selected.form)
        ? key
        : keyFormatterMap[parentType](parent.name, key);
    //const appearance = parentType === "m" ? pipe(stringInput, labelEditable) : stringInput;
    const ref = selected.closest("typed-control");
    insertFragment("s", name, parentType, ref, parent, false);
}

function getParent(selected) {
    const form = selected.form;
    if (!form) return;
    const type = getL3TypeOrDataType(selected);
    const selectedRef = structureTypes.includes(type)
        ? selected.parentElement
        : selected;
    return selectedRef.closest("fieldset, form", form);
}

var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;

function parsePath(string) {
    // TODO use regex that covers all formats
    var result = [];
    if (string.charCodeAt(0) === 46 /* . */) {
        result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
        result.push(
            quote ? subString.replace(reEscapeChar, "$1") : number || match
        );
    });
    return result;
}

function findByRef(node) {
    return nodeMap.get(node);
}

function findByPath(arg, path) {
    const pathClone = [...path];
    const traverse = (arg, cur) => {
        if (hasOwnProp("$key", arg)) {
            //key = arg.$key;
            arg = arg.$value;
        }
        const l3Type = inferL3Type(arg);
        const isTypedControl = l3Type === "c" && arg.$name === "typed-control";
        const children = getChildren(arg, l3Type);
        return isTypedControl
            ? arg.$args[0] === cur
                ? arg
                : null
            : children
                ? children.find(child => traverse(child, cur))
                : null;
    };
    while (pathClone.length && arg) {
        const cur = pathClone.shift();
        arg = traverse(arg, cur);
    }
    return arg;
}

function emitCoreChange({ type }, selected) {
    console.log("emitCoreChange", type);
    const parent = getParent(selected);
    const state = getValue(parent);
    if (type === "-") {
        if (Object.keys(state).length === 1) {
            return alert(
                "Can not remove this control as it is the only one in this parent"
            );
        }
        const ref = selected.closest("typed-control");
        const next = ref.nextElementSibling || ref.previousElementSibling;
        next && getControlByName(parent, next.dataset.name).focus();
        ref.remove();
    } else if (type === ",") {
    // append new parent control
        insertChildControl(selected, parent);
    } else {
        const selectedType = getL3TypeOrDataType(selected);
        if (selectedType === type) {
            return;
        }
        const parentType = getL3TypeOrDataType(parent);
        if (parentType === "c" || parentType === "e") {
            const keyNormalizer = keyNormalizerMap[parentType];
            const index = keyNormalizer(selected.name);
            if (index === 0) {
                return alert(
                    "Can not change type of the $name control for " + typeMap[parentType]
                );
            }
        }
        if (
            getValue(selected) &&
      !confirm(
          "Are you sure want to change the type of this control? The value will be discarded"
      )
        ) {
            return;
        }
        console.log(
            `change type from ${selectedType} to ${type} in parent ${parentType}`
        );
        // FIXME selected.name is the path
        const { name } = selected;
        const ref = selected.closest("typed-control");
        insertFragment(type, name, parentType, ref, parent, true);
    }
}

function insertFragment(type, name, parentType, ref, parent, replace = false) {
    const isAtomicType = hasOwnProp(type, atomicInputTypeMap);
    const fragmentConstructor = isAtomicType
        ? createAtomicFragment
        : createStructuredFragment;
    // fetch correct control
    const fragment = fragmentConstructor(type, name, parentType);
    // instantiate
    const control = run(fragment);
    //target.$name = fragment.$name;
    // insert
    // TODO diff
    parent.insertBefore(control, ref.nextElementSibling);
    // remove original
    if (replace) {
        const target = findByRef(ref);
        target.$args = fragment.$args;
        ref.remove();
    } else {
        const ref = parent.closest("typed-control");
        const target = findByRef(ref || parent);
        const children = ref ? target.$args[1].children : target.$args[0].children;
        children.push(fragment);
    }
    let child = getControlByName(parent, name);
    // focus
    if (!isAtomicType) {
        child = getControls(child)[0];
    }
    child.focus();
}

function createAtomicFragment(type, name, parentType) {
    const input = atomicInputTypeMap[type];
    const appearance =
    parentType === "m"
        ? {
            $name: "label-editable",
            $args: [{ $ref: input }]
        }
        : { $ref: input };
    const fragment = {
        $name: "typed-control",
        $args: [
            {
                appearance,
                name
            }
        ]
    };
    return fragment;
}

function createStructuredFragment(type, name, parentType) {
    const defaultChildName = type === "m" ? "field1" : 0;
    const defaultChildKey = keyFormatterMap[type](name, defaultChildName);
    const child = createAtomicFragment("s", defaultChildKey, type);
    //const field = typedControl(defaultChildKey, childAppearance);
    const constructor = l3Constructors[type];
    //const appearance = parentType === "m" ? pipe(constructor, labelEditable) : constructor;
    const appearance =
    parentType === "m"
        ? {
            $name: "label-editable",
            $args: [{ $ref: constructor }]
        }
        : { $ref: constructor };
    //const control = typedControl(name, appearance, { children: [field] });
    return {
        $name: "typed-control",
        $args: [
            {
                appearance,
                name,
                children: [child],
                legend: true
            }
        ]
    };
}
