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
    function Json2json(template) {
        this.template = template;
    }
    Json2json.prototype.map = function (json) {
        this.root = json;
        return this.mapChild(json, this.template);
    };
    Json2json.prototype.mapChild = function (json, template) {
        var _this = this;
        var fullTemplate = this.getFullTemplate(template);
        var currentJSON = json;
        currentJSON = this.getPropertySafely(currentJSON, fullTemplate.$path);
        if (fullTemplate.$formatting) {
            if (/\[\]/.test(fullTemplate.$path)) {
                currentJSON = currentJSON.map(function (currentJSONItem) { return fullTemplate.$formatting(currentJSONItem); });
            }
            else {
                currentJSON = fullTemplate.$formatting(currentJSON);
            }
        }
        var filteredKeys = Object.keys(fullTemplate).filter(function (key) { return !(/^\$/.test(key)); });
        if (filteredKeys.length === 0) {
            return currentJSON;
        }
        if (/\[\]/.test(fullTemplate.$path)) {
            return currentJSON.map(function (currentJSONItem) {
                var result = {};
                filteredKeys.forEach(function (key) {
                    result[key] = _this.mapChild(currentJSONItem, fullTemplate[key]);
                });
                return result;
            });
        }
        var result = {};
        filteredKeys.forEach(function (key) {
            result[key] = _this.mapChild(currentJSON, fullTemplate[key]);
        });
        return result;
    };
    Json2json.prototype.getFullTemplate = function (template) {
        var fullTemplate = {
            $path: '',
            $formatting: null
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
    // { new_field1: 'field1?.field2?.field3' }
    // 语法参考 https://github.com/tc39/proposal-optional-chaining
    Json2json.prototype.getPropertySafely = function (json, path) {
        var _this = this;
        if (path === void 0) { path = ''; }
        if (path === '')
            return json;
        var splitedPath = path.split(Json2json.PATH_SEPARATOR);
        if (splitedPath[0] === '$root') {
            splitedPath.shift();
            return this.getPropertySafely(this.root, splitedPath.join('.'));
        }
        var result = json;
        var _loop_1 = function (i) {
            if (/\[\]$/.test(splitedPath[i])) {
                var currentKey_1 = splitedPath[i].replace(/\[\]$/, '');
                result = currentKey_1 === '' ? result : result[currentKey_1];
                splitedPath.shift();
                var joinedPath_1 = splitedPath.join('.');
                return { value: result.map(function (jsonItem) {
                        return _this.getPropertySafely(jsonItem, joinedPath_1);
                    }) };
            }
            var currentKey = splitedPath[i].replace(/\?$/, '');
            if (/\?$/.test(splitedPath[i])) {
                if (typeof json[currentKey] === 'undefined') {
                    return { value: undefined };
                }
            }
            result = result[currentKey];
        };
        for (var i = 0; i < splitedPath.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return result;
    };
    Json2json.PATH_SEPARATOR = '.';
    Json2json.PATH_ROOT = '$root';
    return Json2json;
}());
exports.default = Json2json;
//# sourceMappingURL=Json2json.js.map