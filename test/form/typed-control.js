import { elem } from "./dom-constr.js";

export const typedControl = ({ appearance, ...props }) => {
    return elem({
        $name: "typed-control",
        $children: [
            appearance(props)
        ]
    });
};

export default typedControl;