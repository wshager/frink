var n = require("../lib/index");
var as = require("../lib/access-streaming");
//const $prefixes = seq("","antiq.","books.","journals.","online.","sites.","royalties.","z_183.","shared.");
//n.forEach($prefixes, $prefix => {
let $expathPackage = n.vdocStreaming("d:/workspace/benjamins.com/expath-pkg.xml");
as.selectStreaming($expathPackage,"title")
	.subscribe(x => console.log(x+""));
/*
function main() {
	const $prefixes = n.seq("", "antiq.", "books.", "journals.", "online.", "sites.", "royalties.", "z_183.", "shared.");
	return n.forEach($prefixes, $prefix => {
		let $expathPackage = n.vdocStreaming(n.concat("e:/workspace/", $prefix, "benjamins.com/repo.xml"));
		//return $expathPackage;
		return n.toL3(selectStreaming($expathPackage, "description"));
	});
}
*/

/*
xquery version "3.0";

declare namespace repo="http://exist-db.org/xquery/repo";
declare namespace expath="http://expath.org/ns/pkg";

for $prefix in ("","antiq.","books.","journals.","online.","sites.","royalties.","z_183.","shared.")
    let $expath-package := parse-xml(file:read("e:/workspace/" || $prefix || "benjamins.com/expath-pkg.xml"))/expath:package
    let $repo-meta := parse-xml(file:read("e:/workspace/" || $prefix || "benjamins.com/expath-pkg.xml"))/repo:meta
    let $pkg := $expath-package/@abbrev || "-" || $expath-package/@version
    return element app {
        attribute path { $pkg || ".xar" },
        <icon>{ $pkg || ".png" }</icon>,
        <name>{$expath-package/@name/string()}</name>,
        <title>{$expath-package/expath:title/text()}</title>,
        <abbrev>{$expath-package/@abbrev/string()}</abbrev>,
        <version>{$expath-package/@version/string()}</version>,
        if ($expath-package/expath:dependency[starts-with(@processor, "http://exist-db.org")]) then
            <requires>{ $expath-package/expath:dependency[starts-with(@processor, "http://exist-db.org")]/@* }</requires>
        else
            (),
        for $author in $repo-meta/repo:author
            return
                <author>{$author/text()}</author>,
        <description>{$repo-meta/repo:description/text()}</description>,
        <website>{$repo-meta/repo:website/text()}</website>,
        <license>{$repo-meta/repo:license/text()}</license>,
        <type>{$repo-meta/repo:type/text()}</type>,
        for $note in $repo-meta/repo:note
        return
            <note>{$note/text()}</note>,
        <changelog>
        {
            for $change in $repo-meta/repo:changelog/repo:change
            return
                <change version="{$change/@version}">
                { $change/node() }
                </change>
        }
        </changelog>
    }
*/
let xml = `
<app>
	<l3:a name="path" src="/expath-package.xml?concat(select(@abbrev),'-',select(@version))">
	<icon><l3:x src="/expath-package.xml?concat(select(@abbrev),'-',select(@version))"></icon>
`;
