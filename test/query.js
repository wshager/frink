'use strict';
require('source-map-support').install();
var r = require('jsoniq').Runtime;
var it = (function *(){let $x = r.load(r.item([1]));
yield *r.item($x);
})();
for(var item of it) {
   console.log(item);
}

//# sourceMappingURL=data:application/json,{"version":3,"sources":["query.jq"],"names":["MainQuery","flwor","let","it","return"],"mappings":"AAACA;AAAAA;AAAAA;AAAAA,SAADC,cAAIC,gBAAmBC,WAAnBD;AAAqBE,OAAOD,UAAPC;AAAzBH,IAACD;AAAAA;AAAAA;AAAAA"}