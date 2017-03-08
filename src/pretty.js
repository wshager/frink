export function prettyXML(text) {
	const shift = ['\n']; // array of shifts
	const step = '  '; // 2 spaces
	const maxdeep = 100; // nesting level

	// initialize array with shifts //
	for(let ix=0;ix<maxdeep;ix++){
		shift.push(shift[ix]+step);
	}
	var ar = text.replace(/>\s{0,}</g,"><")
				 .replace(/</g,"~::~<")
				 .replace(/xmlns\:/g,"~::~xmlns:")
				 .replace(/xmlns\=/g,"~::~xmlns=")
				 .split('~::~'),
		len = ar.length,
		inComment = false,
		deep = 0,
		str = '',
		ix = 0;

		for(ix=0;ix<len;ix++) {
			// start comment or <![CDATA[...]]> or <!DOCTYPE //
			if(ar[ix].search(/<!/) > -1) {
				str += shift[deep]+ar[ix];
				inComment = true;
				// end comment  or <![CDATA[...]]> //
				if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) {
					inComment = false;
				}
			} else
			// end comment  or <![CDATA[...]]> //
			if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
				str += ar[ix];
				inComment = false;
			} else
			// <elm></elm> //
			if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
				/^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) {
				str += ar[ix];
				if(!inComment) deep--;
			} else
			 // <elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
				str = !inComment ? str += shift[deep++]+ar[ix] : str += ar[ix];
			} else
			 // <elm>...</elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			} else
			// </elm> //
			if(ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += shift[--deep]+ar[ix] : str += ar[ix];
			} else
			// <elm/> //
			if(ar[ix].search(/\/>/) > -1 ) {
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			} else
			// <? xml ... ?> //
			if(ar[ix].search(/<\?/) > -1) {
				str += shift[deep]+ar[ix];
			} else
			// xmlns //
			if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) {
				str += shift[deep]+ar[ix];
			}

			else {
				str += ar[ix];
			}
		}

	return  (str[0] == '\n') ? str.slice(1) : str;
}
