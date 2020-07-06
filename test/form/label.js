import { elem, text } from "./dom-constr.js";
import { mapKeyNormalizer } from "./structural-control-common.js";

export const label = appearance => ({ legend, ...props }) => {
    const target = appearance(props);
    const name = target.name;
    if(legend) {
        elem({
            $name: "legend",
            className: "label-text",
            $children: [text(mapKeyNormalizer(name))]
        }, target, target.firstChild);
        return target;
    }
    const labelText = elem({
        $name: "span",
        className: "label-text",
        $children: [text(mapKeyNormalizer(name))],
    });
    return elem({
        $name: "label",
        $children: [labelText, target]
    });
};
