var n = require("../lib/index");

var l3 = require("l3-model");

var map = require("../lib/map");

const microtime = require("microtime");

function getTask(location, name) {
	return n.doc(n.concat(location, n.string("/tasks/"), name, n.string(".xml")));
}

function getProject(str, location, env) {
	let $doc = n.parse(str);
	return map.default({
		name: n.select($doc, "name", $_0 => n.string($_0)),
		description: n.select($doc, "description", n.string),
		watchfolder: n.select(n.select($doc, "watchfolder"), n.string),
		form: n.select($doc, "form").concatMap(function ($_) {
			return n.select($_, "field").concatMap(function (f) {
				return n.select(f, "@*").reduce(($params, attr) => {
					var v = attr.value();
					for (var k in env) {
						v = n.replace(v, `{$env.${k}}`, env[k]);
					}
					return map.put($params, attr.name(), v);
				}, map.default());
			});
		}),
		tasks: n.select($doc, "tasks", "task").map(function (_) {
			let $name = n.data(n.select(_, "@name"));
			var $tasx = getTask(location, $name);
			//console.log(n.select(tasx,"actions","action").count());
			return map.default({
				name: name,
				description: n.data(n.select($tasx, "description")),
				skip: n.eq(n.data(n.select(_, n.string("@skip"))), n.string("true")),
				dummy: n.eq(n.data(n.select(_, n.string("@dummy"))), n.string("true")),
				async: n.eq(n.data(n.select(_, n.string("@async"))), n.string("true")),
				actioncount: n.select($tasx, "actions", "action", n.count)
			});
		})
	});
}

function walkMenu($in, $groups) {
	var parents = [];
	return l3.toL3(n.vdoc($in).filter(function ($child) {
		//console.log($child);
		if($child.type == 1) {
			let remove = false;
			if($child.name == "item") {
				let group = $child.attr("group");
				if(group) {
					remove = !group.split(",").reduce((a,x) => {
						return $groups.some(y => {
							return y === x;
						});
					},false);
				}
			}
			if(!remove) {
				let parent = parents[parents.length-1];
				if(parent && parent.removed) remove = true;
			}
			$child.removed = remove;
			parents.push($child);
			return !remove;
		} else if($child.type == 17) {
			var last = parents.pop();
			return last.removed ? false : true;
		} else {
			return true;
		}
	}));
}

function nodeToL3Entry(node) {
	var type = node.type,
		name = node.name,
		value = node.value;
	switch (type) {
	case 1:
	case 14:
	{
		let d = [type,name];
		if (type == 1) {
			for(let attr of node.attrEntries()) {
				d.push(2);
				d.push(attr[0]);
				d.push(3);
				d.push(attr[1]);
			}
		}
		return d;
	}
	case 2:
		return [2,name];
	case 5:
	case 6:
	case 17:
		return [type];
	default:
		return [type,value];
	}
}

function getMenu(location, groups) {
	let $doc = n.doc(location);
	let $out = walkMenu($doc, groups);
	let $entries = n.create(o => {
		return l3.fromL3Stream($out,2).subscribe({
			next:node => {
				if(node.type == 17) {
				//console.log(node.parent);
					if(node.parent && node.parent.type == 1 && node.parent.name == "item" && node.node.name != "children") {
						//console.log("not closing",node.node.inode);
						return;
					}
					return o.next([17]);
				}
				if(node.type == 1 && node.name == "item") {
					o.next([6]);
					for(let attr of node.attrEntries()) {
						o.next([2,attr[0]]);
						o.next([3,attr[1]]);
					}
				} else if(node.parent) {
					if(node.parent.type == 1 && node.parent.name == "item") {
						o.next([2,node.name]);
						if(node.name == "children") {
							o.next([5]);
						} else {
							o.next([3,...node.values()]);
						}
					}
				} else {
					o.next(nodeToL3Entry(node));
				}
			},
			complete:() => o.complete()
		});
	}).concatAll();
	//return $entries;
	return l3.fromL3Stream($entries,NaN).first().map(x => x.inode);
	/**/
}

var s = microtime.now();

getMenu(__dirname+"/test.xml",["*"]).subscribe({next:x => x,complete:() => console.log("complete", (microtime.now() - s)/1000)});
