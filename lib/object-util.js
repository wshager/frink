"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const entries = exports.entries = function* (obj) {

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        yield [key, obj[key]];
    }
};

const values = exports.values = function* (obj) {

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        yield obj[key];
    }
};