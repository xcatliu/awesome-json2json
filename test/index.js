const assert = require('assert');
const json2json = require('..').default;

const FOO_BAR_BAZ = {
    foo: {
        bar: {
            baz: 1
        }
    }
}
const ARRAY_FOO_BAR = {
    foo: [
        { bar: 1 },
        { bar: 2 },
        { bar: 3 }
    ]
}
const ARRAY_FOO_BAR_BAZ = {
    foo: {
        bar: [
            { baz: 1 },
            { baz: 2 },
            { baz: 3 }
        ]
    }
}

describe('json2json', () => {
    describe('complexty example', () => {
        it('should match', () => {
            assert.deepEqual(json2json({
                foo: {
                    bar: {
                        baz: 1
                    }
                },
                foo_array: [
                    { bar: 1 },
                    { bar: 2 },
                    { bar: 3 }
                ]
            }, {
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
                        $disable: (foo) => { return foo.bar.baz === 1; },
                        new_baz: 'foo.bar.baz'
                    },
                },
                new_foo_array1: 'foo_array[].bar',
                new_foo_array2: {
                    $path: 'foo_array[]',
                    $formatting: (fooItem) => { return fooItem.bar; }
                },
                new_foo_array3: {
                    $path: 'foo_array[]',
                    new_bar: {
                        $path: 'bar',
                        $formatting: (barValue, { $item: fooItem }) => barValue + fooItem.bar
                    }
                }
            }), {
                new_foo1: 1,
                new_foo2: undefined,
                new_foo3: 1,
                new_foo4: 1,
                new_foo5: {
                    new_bar1: 1,
                    new_bar2: 1,
                    new_bar3: 1
                },
                new_foo_array1: [1, 2, 3],
                new_foo_array2: [1, 2, 3],
                new_foo_array3: [
                    { new_bar: 2 },
                    { new_bar: 4 },
                    { new_bar: 6 }
                ]
            });
        });
    });
    describe('string template', () => {
        it('should match foo.bar.baz value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: 'foo.bar.baz'
            }), {
                new_foo: 1
            });
        });
        it('should get undefined', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: 'foo.bar.baz.qux'
            }), {
                new_foo: undefined
            });
        });
        it('should throw error', () => {
            assert.throws(() => {
                json2json(FOO_BAR_BAZ, {
                    new_foo: 'foo.bar.baz.qux.quux'
                });
            }, /^TypeError: Cannot read property 'quux' of undefined$/);
        });
        it('should get undefined when optional chaining get undefined', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: 'foo.not_exist_key?.bar.baz'
            }), {
                new_foo: undefined
            });
        });
    });
    describe('function template', () => {
        it('should match formatted', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: (root) => root.foo.bar.baz + '_formatted'
            }), {
                new_foo: '1_formatted'
            });
        });
    });
    describe('object template', () => {
        it('should match $path result', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo.bar.baz'
                }
            }), {
                new_foo: 1
            });
        });
        it('should match $formatting result', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $formatting: (root) => {
                        return root.foo.bar.baz + '_formatted';
                    }
                }
            }), {
                new_foo: '1_formatted'
            });
        });
        it('should match $path and $formatting result', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo.bar',
                    $formatting: (bar) => {
                        return bar.baz + '_formatted';
                    }
                }
            }), {
                new_foo: '1_formatted'
            });
        });
        it('should match nested string template value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    new_bar: 'foo.bar.baz'
                }
            }), {
                new_foo: {
                    new_bar: 1
                }
            });
        });
        it('should match nested $path template value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo',
                    new_bar: 'bar.baz'
                }
            }), {
                new_foo: {
                    new_bar: 1
                }
            });
        });
        it('should match nested $path and $formatting template value', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo',
                    $formatting: (foo) => {
                        return {
                            baz2: foo.bar.baz + '_formatted'
                        }
                    },
                    new_bar: 'baz2'
                }
            }), {
                new_foo: {
                    new_bar: '1_formatted'
                }
            });
        });
        it('should match nested $path with $root in template', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo',
                    new_bar: {
                        $path: 'bar',
                        new_baz1: 'baz',
                        new_baz2: '$root.foo'
                    }
                }
            }), {
                new_foo: {
                    new_bar: {
                        new_baz1: 1,
                        new_baz2: {
                            bar: {
                                baz: 1
                            }
                        }
                    }
                }
            });
        });
        it('should disable a field if $disable returns true', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
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
            }), {
                new_foo: {
                    new_bar2: 1
                }
            });
        });
        it('should not disable a field if $disable returns false', () => {
            assert.deepEqual(json2json(FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo',
                    new_bar1: {
                        $disable: (foo) => {
                            return foo.bar.baz !== 1;
                        },
                        new_baz: 'bar.baz'
                    },
                    new_bar2: 'bar.baz'
                }
            }), {
                new_foo: {
                    new_bar1: {
                        new_baz: 1
                    },
                    new_bar2: 1
                }
            });
        });
    });
    describe('array template', () => {
        it('should match arrayed result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: 'foo[].bar'
            }), {
                new_foo: [
                    1,
                    2,
                    3
                ]
            });
        });
        it('should match arrayed $path result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[].bar'
                }
            }), {
                new_foo: [
                    1,
                    2,
                    3
                ]
            });
        });
        it('should match arrayed $path and $formatting result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[].bar',
                    $formatting: (barValue) => barValue + '_formatted'
                }
            }), {
                new_foo: [
                    '1_formatted',
                    '2_formatted',
                    '3_formatted'
                ]
            });
        });
        it('should match arrayed nested result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar: {
                        $formatting: (fooItem) => {
                            return fooItem.bar;
                        }
                    }
                }
            }), {
                new_foo: [
                    { new_bar: 1 },
                    { new_bar: 2 },
                    { new_bar: 3 }
                ]
            });
        });
        it('should match nested arrayed result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo',
                    new_bar: {
                        $path: '[]',
                        $formatting: (fooItem) => {
                            return fooItem.bar;
                        }
                    }
                }
            }), {
                new_foo: {
                    new_bar: [
                        1, 2, 3
                    ]
                }
            });
        });
        it('should match deep arrayed result', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR_BAZ, {
                new_foo: 'foo.bar[].baz'
            }), {
                new_foo: [
                    1,
                    2,
                    3
                ]
            });
        });
        it('should filter array item which $disable return true', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR_BAZ, {
                new_foo: {
                    $path: 'foo.bar[].baz',
                    $disable: (baz) => {
                        return baz === 2;
                    }
                }
            }), {
                new_foo: [
                    1,
                    3
                ]
            });
        });
    });

    describe('context in $formatting', () => {
        it('should have $item context in $formatting argument', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar: {
                        $path: 'bar',
                        $formatting: (barValue, { $item: fooItem }) => {
                            return barValue + '_formatted_' + fooItem.bar;
                        }
                    }
                }
            }), {
                new_foo: [
                    { new_bar: '1_formatted_1' },
                    { new_bar: '2_formatted_2' },
                    { new_bar: '3_formatted_3' }
                ]
            });
        });
        it('should have $root context in $formatting argument', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar1: {
                        $path: 'bar',
                        $formatting: (barValue, { $item: fooItem }) => {
                            return barValue + '_formatted_' + fooItem.bar;
                        }
                    },
                    new_bar2: (fooItem, { $root }) => {
                        return fooItem.bar + '_formatted_' + $root.foo.length;
                    }
                }
            }), {
                new_foo: [
                    {
                        new_bar1: '1_formatted_1',
                        new_bar2: '1_formatted_3'
                    },
                    {
                        new_bar1: '2_formatted_2',
                        new_bar2: '2_formatted_3'
                    },
                    {
                        new_bar1: '3_formatted_3',
                        new_bar2: '3_formatted_3'
                    }
                ]
            });
        });
        it('should have currect $item in deep array', () => {
            assert.deepEqual(json2json({
                foo: [
                    {
                        bar: [
                            { baz: 1 },
                            { baz: 2 },
                            { baz: 3 }
                        ]
                    },
                    {
                        bar: [
                            { baz: 1 },
                            { baz: 2 },
                            { baz: 3 }
                        ]
                    },
                    {
                        bar: [
                            { baz: 1 },
                            { baz: 2 },
                            { baz: 3 }
                        ]
                    },
                ]
            }, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar: {
                        $path: 'bar[]',
                        new_baz: {
                            $path: 'baz',
                            $formatting: (bazValue, { $item: barItem }) => {
                                return bazValue + '_formatted_' + barItem.baz;
                            }
                        }
                    },
                }
            }), {
                new_foo: [
                    {
                        new_bar: [
                            { new_baz: '1_formatted_1' },
                            { new_baz: '2_formatted_2' },
                            { new_baz: '3_formatted_3' },
                        ]
                    },
                    {
                        new_bar: [
                            { new_baz: '1_formatted_1' },
                            { new_baz: '2_formatted_2' },
                            { new_baz: '3_formatted_3' },
                        ]
                    },
                    {
                        new_bar: [
                            { new_baz: '1_formatted_1' },
                            { new_baz: '2_formatted_2' },
                            { new_baz: '3_formatted_3' },
                        ]
                    }
                ]
            });
        });
        it('should have $item and $root context in $disable argument', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar1: {
                        $path: 'bar',
                        $disable: (barValue, { $item: fooItem }) => {
                            return fooItem.bar === 2;
                        }
                    },
                    new_bar2: {
                        $disable: (fooItem, { $root }) => {
                            return fooItem.bar === $root.foo.length;
                        },
                        $formatting: (fooItem) => {
                            return fooItem.bar;
                        }
                    }
                }
            }), {
                new_foo: [
                    { new_bar1: 1, new_bar2: 1 },
                    { new_bar2: 2 },
                    { new_bar1: 3 }
                ]
            });
        });
        it('should support optional array', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'not_exist_array?[]',
                    new_bar: 'bar'
                }
            }), {
                new_foo: []
            });
        });

        it('should have $index context in $formatting argument', () => {
            assert.deepEqual(json2json(ARRAY_FOO_BAR, {
                new_foo: {
                    $path: 'foo[].bar',
                    new_bar: (barValue, { $index }) => {
                        return barValue + '_formatted_with_index_' + $index;
                    }
                }
            }), {
                new_foo: [
                    { new_bar: '1_formatted_with_index_0' },
                    { new_bar: '2_formatted_with_index_1' },
                    { new_bar: '3_formatted_with_index_2' }
                ]
            });
        });
    });

    describe('$item in $path', () => {
        it('should get the $item inside $path', () => {
            assert.deepEqual(json2json({
                foo: [
                    { bar: { baz1: 1, baz2: 2, baz3: 3 }},
                    { bar: { baz1: 1, baz2: 2, baz3: 3 }},
                    { bar: { baz1: 1, baz2: 2, baz3: 3 }}
                ]
            }, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar: {
                        $path: 'bar',
                        new_baz: '$item.bar.baz1'
                    }
                }
            }), {
                new_foo: [
                    { new_bar: { new_baz: 1 } },
                    { new_bar: { new_baz: 1 } },
                    { new_bar: { new_baz: 1 } },
                ]
            });
        });
        it('should have currect $item in deep array', () => {
            assert.deepEqual(json2json({
                foo: [
                    {
                        bar: [
                            { baz: 1 },
                            { baz: 2 },
                            { baz: 3 }
                        ]
                    },
                    {
                        bar: [
                            { baz: 1 },
                            { baz: 2 },
                            { baz: 3 }
                        ]
                    },
                    {
                        bar: [
                            { baz: 1 },
                            { baz: 2 },
                            { baz: 3 }
                        ]
                    },
                ]
            }, {
                new_foo: {
                    $path: 'foo[]',
                    new_bar: {
                        $path: 'bar[]',
                        new_baz: '$item.baz'
                    },
                }
            }), {
                new_foo: [
                    {
                        new_bar: [
                            { new_baz: 1 },
                            { new_baz: 2 },
                            { new_baz: 3 },
                        ]
                    },
                    {
                        new_bar: [
                            { new_baz: 1 },
                            { new_baz: 2 },
                            { new_baz: 3 },
                        ]
                    },
                    {
                        new_bar: [
                            { new_baz: 1 },
                            { new_baz: 2 },
                            { new_baz: 3 },
                        ]
                    },
                ]
            });
        });
    });
});

describe('json2json with clearEmpty option', () => {
    it('should clear undefined value', () => {
        assert.deepEqual(json2json(FOO_BAR_BAZ, {
            new_foo: {
                new_bar1: 'foo.bar.baz',
                new_bar2: 'foo.baz'
            }
        }, {
            clearEmpty: true
        }), {
            new_foo: {
                new_bar1: 1
            }
        });
    });
    it('should clear null value', () => {
        assert.deepEqual(json2json(FOO_BAR_BAZ, {
            new_foo: {
                new_bar1: 'foo.bar.baz',
                new_bar2: () => { return null; }
            }
        }, {
            clearEmpty: true
        }), {
            new_foo: {
                new_bar1: 1
            }
        });
    });
    it('should clear empty object', () => {
        assert.deepEqual(json2json(FOO_BAR_BAZ, {
            new_foo: {
                new_bar1: 'foo.bar.baz',
                new_bar2: () => { return {}; }
            }
        }, {
            clearEmpty: true
        }), {
            new_foo: {
                new_bar1: 1
            }
        });
    });
    it('should clear deep empty object', () => {
        assert.deepEqual(json2json(FOO_BAR_BAZ, {
            new_foo: {
                new_bar1: 'foo.bar.baz',
                new_bar2: {
                    new_baz1: 'foo.baz',
                    new_baz2: () => { return null; }
                }
            }
        }, {
            clearEmpty: true
        }), {
            new_foo: {
                new_bar1: 1
            }
        });
    });
    it('should clear empty array', () => {
        assert.deepEqual(json2json(ARRAY_FOO_BAR, {
            new_foo: {
                new_bar1: 'foo[].bar',
                new_bar2: () => { return []; }
            }
        }, {
            clearEmpty: true
        }), {
            new_foo: {
                new_bar1: [1, 2, 3]
            }
        });
    });
    it('should clear array', () => {
        assert.deepEqual(json2json(ARRAY_FOO_BAR, {
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
        }), {
            new_foo: {
                new_bar1: [1, 2, 3]
            }
        });
    });
});
