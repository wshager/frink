import * as inode from "../iform";

import * as dc from "../doc";

import * as ac from "../access";

import * as va from "../validate";

import * as fu from "../form-util";

export const ensureDoc = dc.ensureDoc.bind(inode);

export const d = dc.d.bind(inode);

export const firstChild = ac.firstChild.bind(inode);

export const lastChild = ac.lastChild.bind(inode);

export const select = ac.select.bind(inode);

export const validate = va.validate.bind(inode);

export const process = fu.process.bind(inode);

export * from "../dom-util";

export * from "../seq";
