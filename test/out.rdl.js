(
	if (or($(was -
			var), (and($(var), $(stop)))), {
			map(pair("t",5),pair("v",$(emit-buffer)))},{if(or($(was-number),(and($(number),$(stop)))),{map(pair("t",8),pair("v",$(emit-buffer)))},{()})}),if($(zero),{xqc:inspect-tokens($(char)$(type))},{()}))
