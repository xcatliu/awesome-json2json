# Awesome json2json

[![Build Status](https://img.shields.io/travis/xcatliu/awesome-json2json.svg)](https://travis-ci.org/xcatliu/awesome-json2json) [![npm package](https://img.shields.io/npm/v/awesome-json2json.svg)](https://www.npmjs.org/package/awesome-json2json) [![npm downloads](http://img.shields.io/npm/dm/awesome-json2json.svg)](https://www.npmjs.org/package/awesome-json2json) 

An awesome json to jsone mapper

## Installation

```bash
npm install awesome-json2json --save
```

## Usage

```js
import json2json from 'awesome-json2json';
// const json2json = require('awesome-json2json').default;

json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: 'foo.bar.baz'
});
// { new_foo: 1 }
```

## Features

### Optional chaining

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: 'foo.not_exist_key?.bar.baz'
});
// { new_foo: undefined }
```

### Function template

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: (root) => {
        return root.foo.bar.baz + '_formatted';
    }
});
// { new_foo: '1_formatted' }
```

### Template with $path and $formatting

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: {
        $path: 'foo.bar',
        $formatting: (bar) => {
            return bar.baz + '_formatted';
        }
    }
});
// { new_foo: '1_formatted' }
```

### Template with nested template

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: {
        $path: 'foo',
        new_bar: 'bar.baz'
    }
});
// { new_foo: { new_bar: 1 }}
```

### Template with nested template with $path and $formatting

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: {
        $path: 'foo',
        $formatting: (foo) => {
            return {
                baz2: foo.bar.baz + '_formatted'
            }
        },
        new_bar: 'baz2'
    }
});
// { new_foo: { new_bar: '1_formatted' }}
```

### Template with $root

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: {
        $path: 'foo',
        new_bar: {
            $path: 'bar',
            new_baz1: 'baz',
            new_baz2: '$root.foo'
        }
    }
});
// new_foo: {
//     new_bar: {
//         new_baz1: 1,
//         new_baz2: {
//             bar: {
//                 baz: 1
//             }
//         }
//     }
// }
```

### Array template

```js
json2json({
    foo: [
        { bar: 1 },
        { bar: 2 },
        { bar: 3 }
    ]
}, {
    new_foo: 'foo[].bar'
});
// { new_foo: [1, 2, 3] }
```

### Array template with formatting

```js
json2json({
    foo: [
        { bar: 1 },
        { bar: 2 },
        { bar: 3 }
    ]
}, {
    new_foo: {
        $path: 'foo[].bar',
        $formatting: (barValue) => barValue + '_formatted'
    }
});
// {
//     new_foo: [
//         '1_formatted',
//         '2_formatted',
//         '3_formatted'
//     ]
// }
```

### Array template with nested template

```js
json2json({
    foo: [
        { bar: 1 },
        { bar: 2 },
        { bar: 3 }
    ]
}, {
    new_foo: {
        $path: 'foo[]',
        new_bar: {
            $formatting: (fooItem) => {
                return fooItem.bar;
            }
        }
    }
});
// {
//     new_foo: [
//         { new_bar: 1 },
//         { new_bar: 2 },
//         { new_bar: 3 }
//     ]
// }
```
