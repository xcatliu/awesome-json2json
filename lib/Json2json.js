"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
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
        var result = this.mapChild(json, this.template);
        if (this.options.clearEmpty) {
            return Json2json.clearEmpty(result);
        }
        return result;
    };
    Json2json.prototype.mapChild = function (json, template) {
        var fullTemplate = this.getFullTemplate(template);
        var currentJSON = this.getJSONByPath(json, fullTemplate.$path);
        if (fullTemplate.$disable) {
            if (this.isArrayTemplate(fullTemplate)) {
                currentJSON = currentJSON.filter(function (currentJSONItem) { return !(fullTemplate.$disable(currentJSONItem)); });
            }
            else {
                if (fullTemplate.$disable(currentJSON)) {
                    return Json2json.DISABLED_FIELD;
                }
            }
        }
        if (fullTemplate.$formatting) {
            currentJSON = this.getFormattedJSON(currentJSON, fullTemplate);
        }
        if (Object.keys(fullTemplate).some(function (key) { return !(/^\$/.test(key)); })) {
            currentJSON = this.getFilteredJSON(currentJSON, fullTemplate);
        }
        return currentJSON;
    };
    Json2json.prototype.getFormattedJSON = function (currentJSON, fullTemplate) {
        if (this.isArrayTemplate(fullTemplate)) {
            return currentJSON.map(function (currentJSONItem) { return fullTemplate.$formatting(currentJSONItem); });
        }
        return fullTemplate.$formatting(currentJSON);
    };
    Json2json.prototype.getFilteredJSON = function (currentJSON, fullTemplate) {
        var _this = this;
        var filteredKeys = Object.keys(fullTemplate).filter(function (key) { return !(/^\$/.test(key)); });
        if (this.isArrayTemplate(fullTemplate)) {
            return currentJSON.map(function (currentJSONItem) {
                var result = {};
                filteredKeys.forEach(function (key) {
                    var childResult = _this.mapChild(currentJSONItem, fullTemplate[key]);
                    if (childResult !== Json2json.DISABLED_FIELD) {
                        result[key] = childResult;
                    }
                });
                return result;
            });
        }
        var result = {};
        filteredKeys.forEach(function (key) {
            var childResult = _this.mapChild(currentJSON, fullTemplate[key]);
            if (childResult !== Json2json.DISABLED_FIELD) {
                result[key] = childResult;
            }
        });
        return result;
    };
    // { new_field1: 'field1?.field2?.field3' }
    // Syntax reference https://github.com/tc39/proposal-optional-chaining
    Json2json.prototype.getJSONByPath = function (json, path) {
        var _this = this;
        if (path === void 0) { path = ''; }
        if (path === '')
            return json;
        var splitedPath = path.split(Json2json.PATH_SEPARATOR);
        if (splitedPath[0] === '$root') {
            splitedPath.shift();
            return this.getJSONByPath(this.root, splitedPath.join('.'));
        }
        var result = json;
        var _loop_1 = function () {
            var currentKey = splitedPath.shift();
            if (/\[\]$/.test(currentKey)) {
                currentKey = currentKey.replace(/\[\]$/, '');
                result = currentKey === '' ? result : result[currentKey];
                var joinedPath_1 = splitedPath.join('.');
                return { value: result.map(function (jsonItem) {
                        return _this.getJSONByPath(jsonItem, joinedPath_1);
                    }) };
            }
            if (/\?$/.test(currentKey)) {
                currentKey = currentKey.replace(/\?$/, '');
                if (result[currentKey] === undefined) {
                    return { value: undefined };
                }
            }
            result = result[currentKey];
        };
        while (splitedPath.length > 0) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return result;
    };
    Json2json.prototype.getFullTemplate = function (template) {
        var fullTemplate = {
            $path: ''
        };
        if (typeof template === 'string') {
            fullTemplate.$path = template;
        }
        else if (typeof template === 'function') {
            fullTemplate.$formatting = template;
        }
        else if (typeof template === 'object') {
            fullTemplate = __assign({}, fullTemplate, template);
        }
        return fullTemplate;
    };
    Json2json.prototype.isArrayTemplate = function (template) {
        return /\[\]/.test(template.$path);
    };
    Json2json.PATH_SEPARATOR = '.';
    Json2json.PATH_ROOT = '$root';
    Json2json.DISABLED_FIELD = '__DISABLED_FIELD__';
    Json2json.clearEmpty = function (json) {
        if (json === undefined ||
            json === null) {
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
                var clearedJSONItem = Json2json.clearEmpty(json[key]);
                if (clearedJSONItem === undefined)
                    return prev;
                return __assign({}, prev, (_a = {}, _a[key] = clearedJSONItem, _a));
                var _a;
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