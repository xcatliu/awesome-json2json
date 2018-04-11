# Awesome json2json

[![Build Status](https://img.shields.io/travis/xcatliu/awesome-json2json.svg)](https://travis-ci.org/xcatliu/awesome-json2json) [![npm package](https://img.shields.io/npm/v/awesome-json2json.svg)](https://www.npmjs.org/package/awesome-json2json) [![npm downloads](http://img.shields.io/npm/dm/awesome-json2json.svg)](https://www.npmjs.org/package/awesome-json2json) 

An awesome json to json mapper

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

## Template

Template is the structure of your output json, the rule of how to map one json data to another. The syntax should look like this:

```js
// Input:
// {
//     foo: {
//         bar: {
//             baz: 1
//         }
//     },
//     foo_array: [
//         { bar: 1 },
//         { bar: 2 },
//         { bar: 3 }
//     ]
// }
//
// Template example:
{
    new_foo1: 'foo.bar.baz',
    new_foo2: 'foo.not_exist_key?.bar.baz',
    new_foo3: (root) => { return root.foo.bar.baz; },
    new_foo4: {
        $path: 'foo',
        $formatting: (foo) => { return foo.bar.baz; }
    },
    new_foo5: {
        $path: 'foo',
        new_bar1: 'bar.baz',
        new_bar2: '$root.foo.bar.baz',
        new_bar3: {
            $formatting: (foo) => { return foo.bar.baz; }
        },
        new_bar4: {
            $disable: (foo) => { return foo.bar.baz === 1; }
            new_baz: 'foo.bar.baz'
        },
    },
    new_foo_array1: 'foo_array[].bar',
    new_foo_array2: {
        $path: 'foo_array[]',
        $formatting: (foo_item) => { return foo_item.bar; }
    }
}
// Output:
// {
//     new_foo1: 1,
//     new_foo2: undefined,
//     new_foo3: 1,
//     new_foo4: 1,
//     new_foo5: {
//         new_bar1: 1,
//         new_bar2: 1,
//         new_bar3: 1
//     },
//     new_foo_array1: [1, 2, 3],
//     new_foo_array2: [1, 2, 3]
// }
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

### Nested template

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: {
        $path: 'foo',
        new_bar: 'bar.baz'
    }
});
// { new_foo: { new_bar: 1 }}
```

### Nested template with $path and $formatting

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

### Nested template with $disable

```js
json2json({ foo: { bar: { baz: 1 }}}, {
    new_foo: {
        $path: 'foo',
        new_bar1: {
            $disable: (foo) => {
                return foo.bar.baz === 1;
            },
            new_baz: 'bar.baz'
        },
        new_bar2: 'bar.baz'
    }
});
// {                
//     new_foo: {
//         new_bar2: 1
//     }
// }
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

### Array template with $formatting

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

### Nested array template

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

### Clear all empty data

Passing `clearEmpty: true` to the third parameter of `json2json` will clear all empty data including `undefined`, `null`, empty object `{}`, empty array `[]`, and combination of empty object and empty array such as `[{}, {}, {}]`

```js
json2json({
    foo: [
        { bar: 1 },
        { bar: 2 },
        { bar: 3 }
    ]
}, {
    new_foo: {
        new_bar1: 'foo[].bar',
        new_bar2: {
            $path: 'foo[]',
            new_baz1: 'baz',
            new_baz2: {
                new_qux: 'baz'
            }
        }
    }
}, {
    clearEmpty: true
});
// {
//     new_foo: {
//         new_bar1: [1, 2, 3]
//     }
// }

