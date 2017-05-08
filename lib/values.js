"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const values = exports.values = function* (obj) {

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {

        yield obj[key];
    }
};