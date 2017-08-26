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

However, what is called virtual DOM is actually not HTML anymore, as it must obey stricter rules than is just required for the representation you download from the server. It's actually a mix of XML and javascript data (AKA JSON). This library tries to formalize that notion. It also provides tried and tested tools for accessing and updating this data model, as they have been developed in the W3C XML working group. These functional tools have been used for years on semi-structured data with great success. As XML has lost its appeal as data modelling language, I try to salvage the good parts with a modern javascript API, for use in the browser and in nodejs.

Frink integrates with legacy XML projects that don't rely on DTD validation.

## API (WIP)

### Constructors

#### e(qname, children) ⇒ <code>VNode</code>
Creates an element node, which can contain multiple nodes of any type.

May be contained in an element, list or map constructor's *children*.

Note that this constructor is *lazy*: the temporary VNode holds a reference to a function. The element will be actualized when its parent VNode calls this function.
 
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| qname  | <code>string, QName</code> | The name of the element |
| children | <code>array, Sequence</code> | The children of the element |

#### a(name,value) ⇒ <code>VNode</code>
Creates an attribute node, which can contain a javascript primitive (string, number or boolean).

May be contained in an element, list or map constructor's *children*.

Note that this constructor is *lazy*: the temporary VNode holds a reference to a function. The attribute will be actualized when its parent VNode calls this function.
 
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string</code> | The name of the attribute |
| value | <code>string, number, boolean</code> | The value of the attribute |

#### x(name,value) ⇒ <code>VNode</code>
Creates a primitive value node, which can contain a javascript primitive (string, number or boolean).

May be contained in an element, list or map constructor's *children*.

Note that this constructor is *lazy*: the temporary VNode holds a reference to a function. The value node will be actualized when its parent VNode calls this function.
 
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string</code> | Optional. The name of the node |
| value | <code>string, number, boolean</code> | The value of the node |

#### l(name,children) ⇒ <code>VNode</code>
Creates a list (AKA array) node, which can contain multiple nodes of any type.

May be contained in an element, list or map constructor's *children*.

Note that this constructor is *lazy*: the temporary VNode holds a reference to a function. The list node will be actualized when its parent VNode calls this function.
 
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string</code> | Optional. The name of the map |
| children | <code>array, Sequence</code> | The children of the map |

#### m(name,children) ⇒ <code>VNode</code>
Creates a map (AKA plain object) node, which can contain multiple nodes of any type.

May be contained in an element, list or map constructor's *children*.

Note that this constructor is *lazy*: the temporary VNode holds a reference to a function. The map node will be actualized when its parent VNode calls this function.
 
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string</code> | Optional. The name of the map |
| children | <code>array, Sequence</code> | The children of the map |

#### d(uri,prefix,doctype) ⇒ <code>VNode</code>
Creates a document node, which can contain a single node of any other type.

This is a top level node, and may not be contained in *children* of other node constructors.

Note that once a document node is actualized, all constructor function references will be called recursively to create the actual document structure.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| uri  | <code>string</code> | Optional. The namespace URI of the document |
| prefix | <code>string</code> | Optional. The namespace prefix of the document |
| doctype | <code>string</code> | Optional. The doctype of the document |

#### p(name,value) ⇒ <code>VNode</code>
Creates a processing instruction node, which can contain a string.


| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string</code> | Optional. The name of the node |
| value | <code>string</code> | The value of the node |

#### c(value) ⇒ <code>VNode</code>
Creates a comment node, which can contain a string.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| value | <code>string</code> | The value of the node |


___

Notes:

* In some cases the name param is optional. A name must be provided to a constructor function when the parent node is of type *map*.
* A document may also be constructed on demand, for example when accessing or modifying a temporary structure.
* Documents can be both persistent (AKA immutable) or plain JSON under the hood. This can be decided when a document node is created.
