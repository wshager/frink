const moo = require("moo");

let lexer = moo.compile({
	WS:      /[ \t]+/,
	number:  /0|[1-9][0-9]*/,
	string:  /"(?:\\["\\]|[^\n"\\])*"/,
	lparen:  "(",
	rparen:  ")",
	keywords: {"1":"+" ,"2":"-", "3":"*"},
	NL:      { match: /\n/, lineBreaks: true },
});

lexer.reset("1 + 2 * 3");
for(let x of lexer) console.log(x);
