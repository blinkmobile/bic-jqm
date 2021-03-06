# BIC: persistent storage

For more information on how we persist Backbone Models and Collections (using
the underlying approach outlined here) see
[persistent-backbone.md](persistent-backbone.md).


## What's out?

We avoid using any of the following mechanisms by default:

- cookies: it would be weird and unsafe to store pending records there
- sessionStorage: volatile, so loses data when the app / browser terminates
- localStorage: inconsistent but frequently low storage cap
- WebSQL: poor quotas, W3C disapproves, Firefox and IE/Edge don't offer it


## What's in?

We do use WebSQL if we are in our native app. Native app shells can provide a
consistent API for WebSQL, and offer access to a large amount of the device's
total storage capacity.

If we are lacking both conditions (native app _and_ WebSQL) and IndexedDB passes
[our reliability tests](https://github.com/blinkmobile/is-indexeddb-reliable),
then we opt for IndexedDB. This is the newest of the persistent storage APIs
offered by the Web Platform, and has known-good quotas.

We use [PouchDB](pouchdb.md) to manage both WebSQL and IndexedDB with a unified
API.

Note: Safari in OS X Yosemite (10.10) and in iOS 7 and 8 does offer IndexedDB,
but it doesn't pass our reliability tests so we don't touch it.


## API: "bic/data" AMD module

This module provides a wrapper around PouchDB that performs the described
detection of suitable storage mechanisms.

- @constructor
- @param {`String`} [name=BlinkMobile] - unique identifier for table / collection

```js
require(['bic/data'], function (Data) {
  var myData = new Data('myData');
  // TODO: do something with `myData`
});
```


### `Data#getDB()`

- @returns {`Promise`}, resolved with the wrapped `PouchDB` instance or a fake
  version that offers no-op APIs (when neither WebSQL or IndexedDB are suitable)

```js
myData.getDB().then(function (pouch) {
  var myPouch = pouch
  // TODO: do something with `myPouch`
});
```


### `Data#hasStorage()`

- @returns {`Boolean`} did we wrap a real PouchDB on WebSQL / IndexedDB?

This won't have reliable results until after `#getDB()` has completed.

```js
myData.getDB().then(function () {
  if (myData.hasStorage()) {
    // TODO: persistent mode, do something that needs real storage
  } else {
    // TODO: volatile mode, inform user they can't expect to store anything
  }
});
```


### `Data#create()`

- @param {`DataDocument`} document ("id" property is optional)
- @returns {`Promise`} resolved with `document` on success

```js
var doc = new DataDocument({
  data: 'value to persist',
  moreData: 'other stuff'
});
var saved;
myData.create(doc)
.then(function (result) {
  saved = new DataDocument(result); // convenient for this example
  console.log('automatic id:', saved.id);
  console.assert(saved.get('data') === doc.get('data'));
  console.assert(saved.get('moreData') === doc.get('moreData'));
})
.then(function () {
  // try to create the same document with the same ID
  return myData.create(saved);
})
.catch(function (err) {
  console.assert(err.error === true);
  // "create" operation not performed due to unique ID conflict
  return Promise.resolve(); // just so we can keep `.then()`ing
});
```


### `Data#update()`

- @param {`DataDocument`} document ("id" property is mandatory)
- @returns {`Promise`} resolved with `document` on success

PouchDB, like CouchDB, stores multiple versions of the same document. You must retrieve the latest revision _before_ you attempt to submit a new revision, otherwise you may encounter conflict errors.

```js
var doc = new DataDocument({
  data: 'value to persist',
  moreData: 'other stuff'
});
myData.create(doc).then(function (result) {
  // now we have the latest revision
  doc = new DataDocument(result);
  doc.set('data', 'something different');
  return myData.update(doc);
})
.then(function (result) {
  console.assert(result.data === 'something different');
});
```


### `Data#read()` and `Data#delete()`

- @param {`DataDocument`} document ("id" property is mandatory)
- @returns {`Promise`} resolved with `document` on success

```js
var doc = new DataDocument({
  id: 'unique-abc'
});
myData.read(doc)
.then(function (result) {
  console.assert(result.id === 'unique-abc');
  // TODO: do something with the other values in the `result` document
})
.then(function () {
  return myData.delete(doc);
});
```


### `Data#readAll()`

- @returns {`Promise`} resolved with `DataDocument[]`

```js
myData.readAll()
.then(function (results) {
  console.assert(Array.isArray(results));
  // TODO: do something with the DataDocuments in the `results` Array
});
```


### `Data#deleteAll()`

- @returns {`Promise`}


### @interface DataDocument

- @property {(`Number`|`String`)} [id] - unique amongst documents in this store


#### `DataDocument.toJSON()`

- @abstract
- @returns {Object} data to store

With the current implementation, we expect all DataDocuments have a `.toJSON()`
method, which must return an Object suitable for JSON serialisation (no Functions).

An easy way to build a conformant constructor that implements this interface is to use Backbone:

```js
var DataDocument = Backbone.Model.extend({ idAttribute: '_id' });
```

Mozilla documents how `Object`s that have a `.toJSON()` method behave
during the [JSON serialisation process](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior).
