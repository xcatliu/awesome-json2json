"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Json2json = /** @class */ (function () {
    function Json2json(template, options) {
        if (options === void 0) { options = {}; }
        this.template = template;
        this.options = options;
    }
    Json2json.prototype.map = function (json) {
        this.root = json;
        var result = this.mapChild(json, this.template, { $root: this.root });
        if (this.options.clearEmpty) {
            return Json2json.clearEmpty(result);
        }
        return result;
    };
    Json2json.prototype.mapChild = function (json, template, context) {
        var fullTemplate = this.getFullTemplate(template);
        var currentJSON = this.getJSONByPath(json, fullTemplate.$path, context);
        if (fullTemplate.$disable) {
            if (this.isArrayTemplate(fullTemplate)) {
                currentJSON = currentJSON.filter(function (currentJSONItem) {
                    return !fullTemplate.$disable(currentJSONItem, __assign(__assign({}, context), { $item: currentJSONItem }));
                });
            }
            else {
                if (fullTemplate.$disable(currentJSON, context)) {
                    return Json2json.DISABLED_FIELD;
                }
            }
        }
        if (!fullTemplate.$formatting && fullTemplate.$default) {
            var $func_1 = typeof fullTemplate.$default === 'function' ? fullTemplate.$default : function () { return fullTemplate.$default; };
            fullTemplate.$formatting = function (val) { return (typeof val === 'undefined' ? $func_1() : val); };
        }
        if (fullTemplate.$formatting) {
            if (this.isArrayTemplate(fullTemplate)) {
                currentJSON = currentJSON.map(function (currentJSONItem) {
                    return fullTemplate.$formatting(currentJSONItem, __assign(__assign({}, context), { $item: currentJSONItem }));
                });
            }
            else {
                currentJSON = fullTemplate.$formatting(currentJSON, context);
            }
        }
        if (Object.keys(fullTemplate).some(function (key) { return !/^\$/.test(key); })) {
            return this.getFilteredJSON(currentJSON, fullTemplate, context);
        }
        else {
            return currentJSON;
        }
    };
    Json2json.prototype.getFilteredJSON = function (currentJSON, fullTemplate, context) {
        var _this = this;
        var filteredKeys = Object.keys(fullTemplate).filter(function (key) { return !/^\$/.test(key); });
        if (this.isArrayTemplate(fullTemplate)) {
            var index_1 = 0;
            return currentJSON.map(function (currentJSONItem) {
                var result = {};
                filteredKeys.forEach(function (key) {
                    var childResult = _this.mapChild(currentJSONItem, fullTemplate[key], __assign(__assign({}, context), { $item: currentJSONItem, $index: index_1 }));
                    if (childResult !== Json2json.DISABLED_FIELD) {
                        result[key] = childResult;
                    }
                    index_1 += 1;
                });
                return result;
            });
        }
        var result = {};
        filteredKeys.forEach(function (key) {
            var childResult = _this.mapChild(currentJSON, fullTemplate[key], context);
            if (childResult !== Json2json.DISABLED_FIELD) {
                result[key] = childResult;
            }
        });
        return result;
    };
    // { new_field1: 'field1?.field2?.field3' }
    // Syntax reference https://github.com/tc39/proposal-optional-chaining
    Json2json.prototype.getJSONByPath = function (json, path, context) {
        var _this = this;
        var _a;
        if (path === '' || path.length === 0)
            return json;
        var splitPath = Array.isArray(path) ? path.slice() : path.split('.');
        if (splitPath[0] === '$root') {
            splitPath.shift();
            return this.getJSONByPath(this.root, splitPath, context);
        }
        if (splitPath[0] === '$item') {
            splitPath.shift();
            return this.getJSONByPath(context.$item, splitPath, context);
        }
        var result = json;
        while (splitPath.length > 0) {
            var currentKey = splitPath.shift();
            if (currentKey === '$head') {
                result = (_a = result === null || result === void 0 ? void 0 : result[0]) !== null && _a !== void 0 ? _a : null;
                continue;
            }
            if (/\[\]$/.test(currentKey)) {
                currentKey = currentKey.replace(/\[\]$/, '');
                if (/\?$/.test(currentKey)) {
                    currentKey = currentKey.replace(/\?$/, '');
                    if (result[currentKey] === undefined) {
                        return [];
                    }
                }
                result = currentKey === '' ? result : result[currentKey];
                return result.map(function (jsonItem) {
                    return _this.getJSONByPath(jsonItem, splitPath, __assign(__assign({}, context), { $item: jsonItem }));
                });
            }
            if (/\?$/.test(currentKey)) {
                currentKey = currentKey.replace(/\?$/, '');
                if (result[currentKey] === undefined) {
                    return undefined;
                }
            }
            result = result[currentKey];
        }
        return result;
    };
    Json2json.prototype.getFullTemplate = function (template) {
        var fullTemplate = {
            $path: '',
        };
        if (typeof template === 'string') {
            fullTemplate.$path = template;
        }
        else if (typeof template === 'function') {
            fullTemplate.$formatting = template;
        }
        else if (typeof template === 'object') {
            fullTemplate = __assign(__assign({}, fullTemplate), template);
        }
        return fullTemplate;
    };
    Json2json.prototype.isArrayTemplate = function (template) {
        return /\[\]/.test(template.$path);
    };
    Json2json.DISABLED_FIELD = '__DISABLED_FIELD__';
    Json2json.clearEmpty = function (json) {
        if (json === undefined || json === null) {
            return undefined;
        }
        if (Array.isArray(json)) {
            var clearedJSON = json.map(Json2json.clearEmpty).filter(function (jsonItem) { return jsonItem !== undefined; });
            if (clearedJSON.length === 0)
                return undefined;
            return clearedJSON;
        }
        if (typeof json === 'object') {
            var clearedJSON = Object.keys(json).reduce(function (prev, key) {
                var _a;
                var clearedJSONItem = Json2json.clearEmpty(json[key]);
                if (clearedJSONItem === undefined)
                    return prev;
                return __assign(__assign({}, prev), (_a = {}, _a[key] = clearedJSONItem, _a));
            }, {});
            if (Object.keys(clearedJSON).length === 0)
                return undefined;
            return clearedJSON;
        }
        return json;
    };
    return Json2json;
}());
exports.default = Json2json;
//# sourceMappingURL=Json2json.js.map