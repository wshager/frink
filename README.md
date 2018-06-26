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

## API (WIP)

### Sequences

Sequences come in two flavors. The default (ArraySeq) is based on a javascript array, the other is an Observable sequence. The two are interopable, to the extend that the array-based Sequence implements a limited number of methods from RxJS and converts to an Observable when needed. To guarantee interoperability, you should use the functions provided by Frink instead of RxJS.

#### seq(...) => <code>ArraySeq|Observable</code>

Creates a sequence. Any sequences or iterables (except strings) in arguments are flattened. In case any argument is an Observable or a Promise, the sequence is converted to an Observable.

#### zeroOrOne(seqOrValue) => <code>ArraySeq|Observable</code>

Tests a sequence for cardinality. If it contains zero or one item, the sequence is returned. Else an error is thrown instead.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |


#### exactlyOne(seqOrValue) => <code>ArraySeq|Observable</code>

Tests a sequence for cardinality. If it contains exactly one item, the sequence is returned. Else an error is thrown instead.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |


#### oneOrMore(seqOrValue) => <code>ArraySeq|Observable</code>

Tests a sequence for cardinality. If it contains one or more items, the sequence is returned. Else an error is thrown instead.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |


#### empty(seqOrValue) => <code>Boolean|Observable<Boolean></code>

Tests is a sequence is entry. Returns a boolean (for `ArraySeq` or `null`) or an `Observable` holding a boolean value if the param is an Observable.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |


#### exists(seqOrValue) => <code>Boolean|Observable<Boolean></code>

The opposite of `empty`. Returns a boolean for `ArraySeq` or any other value that isn't a sequence. Returns an `Observable` holding a boolean value if the param is an Observable.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |


#### forEach(seqOrValue, fn)

Apply function to value or each value in sequence.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |
| fn | <code>function</code> | Transformation |


#### filter(seqOrValue, fn)

Filter value or values in sequence based on provided function.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |
| fn | <code>function</code> | Filter function |


#### foldLeft(seqOrValue[, seed], fn)

Reduce sequence or value to a new sequence.

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| seqOrValue | <code>ArraySeq|Observable|\*</code> | The sequence or value to test |
| fn | <code>function</code> | Transformation |
