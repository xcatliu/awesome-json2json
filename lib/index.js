"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Json2json_1 = require("./Json2json");
function json2json(json, template) {
    var mapper = new Json2json_1.default(template);
    return mapper.map(json);
}
exports.default = json2json;
//# sourceMappingURL=index.js.map