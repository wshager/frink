# Frink: everything but the kitchen sink

Parse XML into a DOM level 4 compatible, persistent (AKA immutable) virtual tree.

Traverse trees with speed-optimized functions reminiscent of XPath.

Parse JSON into similar, traversable trees, or mix with XML.

Generate L3, a lightweight, flat representation of XML or JSON trees (or mixed) for fast storage and retrieval.

Construct trees with a coherent set of functions, to create persistent HTML, XML or JSON documents.

Render persistent trees or L3 as HTML in the browser. Uses a super-simple, lightning-fast tree diffing algorithm.

Validate both XML and JSON using a custom extension of JSON Schema v0.4.

To be used together with [Raddle](http://raddle.org)'s standards-based document processing language.

---

## Why Frink?

> It is not the spoon that bends

The browser's DOM API is ... inconvenient. The stuff you see in a web application is not always represented in the source code. Instead, they are in some part of the browser you need to access or update. So, like others have done before, we'll just connect to those parts and modify our document as though they're already part of it. I didn't come up with this idea: it's called virtual DOM, and there are many libraries out there that work like this.

However, what is called virtual DOM is actually not HTML anymore, as it must obey stricter rules than is just required for the representation you download from the server. It's actually a mix of XML and javascript data (AKA JSON). This library tries to formalize that notion, in a data model called [L3N](http://l3n.org). It also provides tried and tested tools for accessing and updating this data model, as they have been developed in the W3C XML working group. These functional tools have been used for years on semi-structured data with great success. As XML has lost its appeal as data modelling language, I try to salvage the good parts with a modern javascript API, for use in the browser and in nodejs.

Frink integrates with legacy XML projects that don't rely on DTD validation.

## The Concept

The core concept of Frink is that any document can be iterated (or streamed) as a flat sequence of nodes, be it an XML or HTML document, a piece of JSON or even a functional program (written, for example, in XQuery, RQL or RDL). The way these documents are traversed is in *document order*, just like XML is usually streamed: each node is emitted, and if it's a branch (e.g. an element) the closing of the node is emitted as well. In the browser there's a related (and rather obscure it seems) feature in javascript called "TreeWalker". This allows one to iterate HTML nodes in document order, but it doesn't include the closing of branches. To ameliorate this, a small wrapper can be used to accomplish the same behaviour that Frink is based on (uses ES6 WeakMap): https://gist.github.com/wshager/edb8aadccb6f06fa566cc3d58a098f4c.

Instead of just emitting every node as-is, Frink also wraps each node in a container object. This way the same interface can be used to "real" DOM nodes as well as "virtual" ones. In addition to helper methods, the wrapper provides the depth and index of the node in the document, as well as the index of the node in the parent. Frink also provides an immutable alternative to "traditional" mutable virtual nodes. Because of this, the node wrapper also provides access to the parent node, which would not be possible to store in an immutable structure. The wrapping is read-only and ephemeral, as it gets created upon each traversal and destroyed afterwards. From an API perspective this means you shouldn't create references to wrapper nodes elsewhere, or they can't be garbage collected. Instead, you should use functions like `forEach` (AKA `map`) to transform them.

## API (WIP)

### Constructors

The shorthand for constructor functions is inspired by HyperScript, which is in turn inspired by put-selector, which was inspired by JSON-query, which was inspired by XPath, which is based on XML DOM. Besides, I didn't want names like `createElement` etc. You may wish to alias the functions in your code.

#### e(name, children) ⇒ <code>VNode</code>
Creates an element node, which can contain multiple nodes of any type, except `document`.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string, QName</code> | The name of the element |
| children | <code>VNode*</code> | The children of the element (array, ArraySeq or Observable) |

#### a(name,value) ⇒ <code>VNode</code>
Creates an attribute node under an element, or a tuple under a map. Can contain a single node of any other type, except `document` and `attribute`. Note that when serializing to XML, attribute values are converted to a string following serializer parameters.

When the parent is not an element or map, an error will be produced.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string</code> | The name of the attribute or tuple |
| value | <code>string, VNode</code> | The value of the attribute |

#### x(value) ⇒ <code>VNode</code>
Creates a primitive value node, which can contain a javascript primitive (string, number, boolean or null).

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| value | <code>string, number, boolean, null</code> | The value of the node |

#### r(value) ⇒ <code>VNode</code>
Creates a "reference" (or link) node, which can contain a (partial) URI-formatted string.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| value | <code>string</code> | The value of the node |

#### l(children) ⇒ <code>VNode</code>
Creates a list (AKA array) node, which can contain multiple nodes of any type, except `document` and `attribute`.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| children | <code>VNode*</code> | The children of the list (array, ArraySeq or Observable) |

#### m(children) ⇒ <code>VNode</code>
Creates a map (AKA plain object) node, which can contain multiple nodes of type `attribute`.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| children | <code>VNode*</code> | The children of the map (array, ArraySeq or Observable) |

#### d(children) ⇒ <code>VNode</code>
Creates a document node, which can contain a single node of any other type, except `document` and `attribute`, in addition to multiple processing instruction nodes. In general, documents aren't constructed directly, but created by the parser.

This is a top level node, and may not be contained in other nodes.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| children | <code>VNode*</code> | The children of the document (array, ArraySeq or Observable) |

#### p(target,content) ⇒ <code>VNode</code>
Creates a processing instruction node.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| target  | <code>string</code> |  The target part of the PI |
| content | <code>string</code> | The content part of the PI |


#### c(value) ⇒ <code>VNode</code>
Creates a comment node, which can contain a string.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| value | <code>string</code> | The value of the node |


#### f(qname,arguments) ⇒ <code>VNode</code>
Creates a "function call" node, which can contain nodes of any other type, except `attribute`.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| qname | <code>string, QName</code> | The name of the function |
| arguments | <code>Array</code> | The arguments to the function as an array |


#### q(body) ⇒ <code>VNode</code>
Creates a "quotation" (AKA lambda) node, which can contain nodes of any other type, except `attribute`.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| body | <code>Array</code> | The arguments to the function as an array |


___

Notes:

* Constructors are *lazy*: the temporary VNode holds a reference to a function. The node will be actualized when its parent VNode calls this function.
* Once a root node is actualized, all constructor function references will be called recursively to create the actual document structure.
* A document may also be actualized on demand, for example when accessing or modifying a temporary structure.
* Documents can be persistent or non-persistent JSON under the hood. This can be decided when a document is actualized. The VNode interface can also be used to wrap HTML DOM nodes.
____

### Sequences

Sequences come in two flavors. The default (ArraySeq) is based on a javascript array, the other is an Observable sequence. The two are interopable, to the extend that the array-based Sequence implements a limited number of methods from RxJS and converts to an Observable when needed. To guarantee interoperability, you should use the functions provided by Frink instead of methods on objects.

#### seq(...) => <code>ArraySeq|Observable</code>

Creates a sequence. Any sequences or iterables (except strings) in arguments are flattened. In case any argument is an Observable or a Promise, the sequence is converted to an Observable.

#### zeroOrOne(seq) => <code>ArraySeq|Observable</code>

Tests a sequence for cardinality. If it contains zero or one item, the sequence is returned. Else an error is thrown instead.

#### exactlyOne(seq) => <code>ArraySeq|Observable</code>

Tests a sequence for cardinality. If it contains exactly one item, the sequence is returned. Else an error is thrown instead.

#### oneOrMore(seq) => <code>ArraySeq|Observable</code>

Tests a sequence for cardinality. If it contains one or more items, the sequence is returned. Else an error is thrown instead.

#### empty(seq) => <code>Boolean|Observable<Boolean></code>



____

## Examples

```javascript
import { e, a, seq } from "frink";

e("div",seq(
  a("class","greeting"),
  e("p","Hello")
));
```

HTML serialization (duh):

```html
<div class="greeting">
 <p>Hello</p>
</div>
```

JSON:

```json
{
  "$name":"div",
  "$attrs": {"class":"greeting"},
  "$children":[{
    "$name":"p",
    "$attrs": {},
    "$children":["Hello"]
  }]
}
```

```javascript
import { m, a } from "frink";

n.m(
  n.a("greeting","Hello")
);
```

HTML serialization:

```html
<l3-m>
 <l3-a name="greeting">Hello</l3-a>
</l3-m>
```

JSON (duh):

```json
{
  "greeting":"Hello"
}
```

____

## Serialization rules

L3N serialization rules for JSON:

| Constant | VNode Type                | Appearance  |
| -------- | ------------------------- | ----------- |
| 1 | Element | `{"$name":"qname","$attrs":{"some-attr":"some-value"},"$children":[]}` |
| 3 | teXt | `"some-text"` |
| 4 | Reference | `{"$ref":"/some/path"}` |
| 5 | List | `[]` |
| 6 | Map | `{}` |
| 7 | Processing instruction | `{"$pi"":"xml-stylesheet "\"type\"=\"text/xsl\" \"href\"=\"some.xsl\""}` |
| 8 | Comment | `{"$comment":"some-comment"}`|
| 12 | teXt | `123`, `true` or `null` |
| 14 | Function call | `{"$name":"some-function","$args":[]}` |

____

L3N serialization rules for XML:

| Constant | VNode Type                | Appearance  |
| -------- | ------------------------- | ----------- |
| 1 | Element | `<some-element some-attr="some-value"></some-element>` |
| 3 | teXt | `some-text` |
| 4 | Reference | `<include xmlns="http://www.w3.org/2001/XInclude" href="/some/path" parse="xml"/>` |
| 5 | List | `<l3:l xmlns:l3="http://l3n.org"></l3:l>` |
| 6 | Map | `<l3:m xmlns:l3="http://l3n.org"><l3:a name="my-xml-tuple"><some-element /></l3:a></l3:m>` |
| 7 | Processing instruction | `<?xml-stylesheet type="text/xsl" href="some.xsl" ?>` |
| 8 | Comment | `<!-- some-comment -->`|
| 12 | teXt | `<l3:x xmlns:l3="http://l3n.org">123</l3:x>` |
| 14 | Function call | `<l3:f xmlns:l3="http://l3n.org" name="some-function"></l3:f>` |

____

L3N serialization rules for HTML:

| Constant | VNode Type                | Appearance  |
| -------- | ------------------------- | ----------- |
| 1 | Element | `<some-element some-attr="some-value"></some-element>` |
| 3 | teXt | `some-text` |
| 4 | Reference | `<link rel="import" href="/some/path">` |
| 5 | List | `<l3-l></l3-l>` |
| 6 | Map | `<l3-m><some-element data-l3-name="my-html-tuple" /></l3-m>` |
| 7 | Processing instruction | N/A |
| 8 | Comment | `<!-- some-comment -->`|
| 12 | teXt | `<l3-x>123</l3-x>` |
| 14 | Function call | `<l3-f name="some-function"></l3-f>` |
