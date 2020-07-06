import { elem, attr, text } from "./dom-constr.js";
import { mapKeyNormalizer, getMapNameRoot } from "./structural-control-common.js";
import { seq, forEach, replayable } from "./seq-common.js";
import { on } from "./bindings.js";

// Runnable, Labelable => Runnable, Labeled
/*
export const labelEditable = ({ $name, $children = [], name, dataset, ...props }) => {
    const structureType = structureTypes.includes(dataset.type);
    const updatedName = {
        $name: "$",
        $args: [
            "updated-name",
            {
                $name: "on",
                $args: [
                    {
                        $name: "$",
                        $args: [ "label-text" ]
                    },
                    "input",
                    {
                        $name:"get-target-text-content",
                        $args: [
                            name
                        ]
                    },
                    {
                        $name: "$",
                        $args: [
                            "name"
                        ]
                    }
                ]
            }
        ]
    };
    const child = {
        $name,
        ...props,
        $children: [
            {
                $name: "name",
                $value: {
                    $name: "$",
                    $args: [
                        "updated-name"
                    ]
                }
            },
            ...$children
        ]
    };
    const labelText = { // $label-text
        $name: "$",
        $args: [
            "label-text",
            structureType
                ? {
                    $name: "legend",
                    className: "label-text",
                    contentEditable: true,
                    $children: [
                        {
                            $name: "$",
                            $args: [
                                "name",
                            ]
                        }
                    ]
                }
                : {
                    $name: "span",
                    className: "label-text",
                    contentEditable: true,
                    $children: [
                        {
                            $name: "for-each",
                            $args: [
                                {
                                    $name: "$",
                                    $args: [ "name" ]
                                },
                                {
                                    $ref: "map-key-normalizer"
                                }
                            ]
                        }
                    ]
                }
        ],
    };

    return {
        $name: "",
        $args: [
            {
                $name: "$",
                $args: [
                    "name",
                    {
                        $name: "replayable",
                        $args: [
                            name, // pre-evaluate
                        ]
                    }
                ]
            },
            labelText,
            updatedName,
            ...structureType
                ? [
                    child,
                    {
                        $name: "$",
                        $args: [ "label-text" ]
                    },
                ]
                : [
                    {
                        $name: "label",
                        className: "label-editable",
                        $children: [
                            {
                                $name: "$",
                                $args: [ "label-text" ]
                            },
                            child
                        ]
                    }
                ]
        ]
    };
};
*/
/*
{
    $name: "$",
    $args: [
        "updated-name",
        {
            $name: "on",
            $args: [
                {
                    $name: "$",
                    $args: [ "label-text" ]
                },
                "input",
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
                },
                {
                    $name: "$",
                    $args: [
                        "name"
                    ]
                }
            ]
        }
    ]
},
{
    $name,
    ...props,
    $children: [
        {
            $name: "name",
            $value: {
                $name: "$",
                $args: [
                    "updated-name"
                ]
            }
        },
        ...$children
    ]
},
*/

export const labelEditable = appearance => ({ name, children = [], legend, ...props }) => {
    const $name = replayable(name);
    // TODO live computed attribute
    const nameRoot = getMapNameRoot(name);
    const getTargetTextContent = evt => nameRoot + evt.target.textContent;
    const nodeName = legend ? "legend" : "span";
    const labelText = elem({
        $name: nodeName,
        className: "label-text",
        contentEditable: true,
        $children: [text(forEach($name, mapKeyNormalizer))]
    });
    const $updatedName = on(labelText, "input", getTargetTextContent, $name);
    const a = attr({ $name: "name", $value: $updatedName });
    // pass computed property as attr to target
    const target = appearance({
        ...props,
        name,
        children: [
            a,
            ...children,
        ]
    });
    //const child = bindAttribute(bindAttribute(target, 'name', $updatedName), 'placeholder', $updatedName);
    //let $bound-child := <{...$child} name="{$updated-name}"/> (: spread into empty element does something like
    //Labelable.removeAttribute('name');
    // const child = replaceAttributeNode(target, attr({ $name: "name", $value: $updatedName }));
    const _insert = (target, child, ref) => {
        target.insertBefore(child, ref);
        return target;
    };
    return legend
        ? _insert(target, labelText, target.firstElementChild)
        : elem({
            $name: "label",
            className: "label-editable",
            $children: seq(labelText, target)
        });
};

export default labelEditable;
