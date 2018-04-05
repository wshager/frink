const n = require("../lib/index");
const console = require("../lib/console");

console.log("bool",n.true(),n.false());

console.log("lt",n.lt(n.integer(10),n.integer(2)));

console.log("eq",n.eq(n.integer(2),n.integer(2)));

console.log("eq-empty",n.eq(n.seq(),n.seq(2)));

console.log("and",n.and(n.seq(n.false()),n.seq(n.true())));

console.log("and",n.and(n.true(),n.true()));

console.log("and",n.and(n.false(),n.false()));

console.log("and",n.and(n.seq(n.true()),n.false()));

console.log("and-empty",n.and(n.true(),n.seq()));

console.log("empty-and",n.and(n.seq(),n.true()));

console.log("and-empty",n.and(n.seq(n.true()),n.seq()));

console.log("empty-and",n.and(n.seq(),n.seq(n.true())));

console.log("or",n.or(n.false(),n.true()));

console.log("or",n.or(n.true(),n.true()));

console.log("or",n.or(n.false(),n.false()));

console.log("or",n.or(n.true(),n.false()));

console.log("empty-or",n.or(n.seq(),n.true()));

console.log("or-empty",n.or(n.true(),n.seq()));

console.log("empty-or",n.or(n.seq(),n.false()));

console.log("or-empty",n.or(n.false(),n.seq()));
