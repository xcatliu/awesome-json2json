"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Json2json_1 = require("./Json2json");
function json2json(json, template, options) {
    if (options === void 0) { options = {}; }
    var json2jsonInstance = new Json2json_1.default(template, options);
    return json2jsonInstance.transform(json);
}
exports.default = json2json;
//# sourceMappingURL=index.js.map