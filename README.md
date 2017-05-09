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

However, what is called virtual DOM is actually not HTML anymore, as it must obey stricter rules than is just required for the representation you download from the server. It's actually a mix of XML and javascript data (AKA JSON). This library tries to formalize that notion. It also provides tried and tested tools for accessing and updating this data model, as they have been developed in the XML tool chain. These functional tools have been used for years on semi-structured data with great success. As XML has lost it's appeal as data modelling language, I try to salvage the good parts, for use in the browser and in nodejs.

##API

### Constructors

#### e(qname, children) ⇒ <code>VNode</code>
Creates an element. 
Note that this function is *lazy*: the temporary VNode holds a reference to a function. The element will be actualized when its parent VNode calls the function.
 
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| qname  | <code>string|QName</code> | The name of the element |
| children | <code>array|Sequence</code> | The children of the element |

#### a(name,value) ⇒ <code>VNode</code>
Creates an attribute. 
May be contained in an element constructor's *children*.
 
| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| name  | <code>string</code> | The name of the attribute |
| value | <code>Value</code> | The value of the attribute |
