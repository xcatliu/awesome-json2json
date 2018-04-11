export type Template<T = any> = IFullTemplate<T> | string | Function;

export interface IFullTemplate<T = any> {
    $path?: string;
    $formatting?: Function;
    $disable?: Function;
    [propName: string]: Template<T>;
}

export interface IJson2jsonOptions {
    clearEmpty?: boolean;
}

export default class Json2json<T> {
    private static PATH_SEPARATOR = '.';
    private static PATH_ROOT = '$root';
    private static DISABLED_FIELD = '__DISABLED_FIELD__';
    public static clearEmpty = (json) => {
        if (
            json === undefined ||
            json === null
        ) {
            return undefined;
        }
        if (Array.isArray(json)) {
            const clearedJSON = json.map(Json2json.clearEmpty).filter((jsonItem) => jsonItem !== undefined)
            if (clearedJSON.length === 0) return undefined;
            return clearedJSON;
        }
        if (typeof json === 'object') {
            const clearedJSON = Object.keys(json).reduce((prev, key) => {
                const clearedJSONItem = Json2json.clearEmpty(json[key]);
                if (clearedJSONItem === undefined) return prev;
                return {
                    ...prev,
                    [key]: clearedJSONItem
                };
            }, {});
            if(Object.keys(clearedJSON).length === 0) return undefined;
            return clearedJSON;
        }
        return json;
    }
    private template: Template<T>;
    private options: IJson2jsonOptions;
    private root;
    constructor(template: Template<T>, options: IJson2jsonOptions = {}) {
        this.template = template;
        this.options = options;
    }
    public map(json) {
        this.root = json;
        const result = this.mapChild(json, this.template);
        if (this.options.clearEmpty) {
            return Json2json.clearEmpty(result);
        }
        return result;
    }
    private mapChild(json, template: Template) {
        const fullTemplate = this.getFullTemplate(template);
        let currentJSON = this.getJSONByPath(json, fullTemplate.$path);

        if (fullTemplate.$disable) {
            if (this.isArrayTemplate(fullTemplate)) {
                currentJSON = currentJSON.filter((currentJSONItem) => !(fullTemplate.$disable(currentJSONItem)));
            } else {
                if (fullTemplate.$disable(currentJSON)) {
                    return Json2json.DISABLED_FIELD;
                }
            }
        }

        if (fullTemplate.$formatting) {
            currentJSON = this.getFormattedJSON(currentJSON, fullTemplate);
        }

        if (Object.keys(fullTemplate).some((key) => !(/^\$/.test(key)))) {
            currentJSON = this.getFilteredJSON(currentJSON, fullTemplate);
        }

        return currentJSON;
    }
    private getFormattedJSON(currentJSON, fullTemplate: IFullTemplate) {
        if (this.isArrayTemplate(fullTemplate)) {
            return currentJSON.map((currentJSONItem) => fullTemplate.$formatting(currentJSONItem));
        }
        return fullTemplate.$formatting(currentJSON);
    }
    private getFilteredJSON(currentJSON, fullTemplate: IFullTemplate) {
        const filteredKeys = Object.keys(fullTemplate).filter((key) => !(/^\$/.test(key)));

        if (this.isArrayTemplate(fullTemplate)) {
            return currentJSON.map((currentJSONItem) => {
                let result = {};
                filteredKeys.forEach((key) => {
                    const childResult = this.mapChild(currentJSONItem, fullTemplate[key]);
                    if (childResult !== Json2json.DISABLED_FIELD) {
                        result[key] = childResult;
                    }
                });
                return result;
            });
        }

        let result = {};
        filteredKeys.forEach((key) => {
            const childResult = this.mapChild(currentJSON, fullTemplate[key]);
            if (childResult !== Json2json.DISABLED_FIELD) {
                result[key] = childResult;
            }
        });
        return result;
    }
    // { new_field1: 'field1?.field2?.field3' }
    // Syntax reference https://github.com/tc39/proposal-optional-chaining
    private getJSONByPath(json, path = '') {
        if (path === '') return json;
        const splitedPath = path.split(Json2json.PATH_SEPARATOR);
        if (splitedPath[0] === '$root') {
            splitedPath.shift();
            return this.getJSONByPath(this.root, splitedPath.join('.'));
        }
        let result = json;
        while (splitedPath.length > 0) {
            let currentKey = splitedPath.shift();
            if (/\[\]$/.test(currentKey)) {
                currentKey = currentKey.replace(/\[\]$/, '');
                result = currentKey === '' ? result : result[currentKey];
                const joinedPath = splitedPath.join('.');
                return result.map((jsonItem) => {
                    return this.getJSONByPath(jsonItem, joinedPath);
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
    }
    private getFullTemplate(template: Template) {
        let fullTemplate: IFullTemplate = {
            $path: ''
        };

        if (typeof template === 'string') {
            fullTemplate.$path = template;
        } else if (typeof template === 'function') {
            fullTemplate.$formatting = template;
        } else if (typeof template === 'object') {
            fullTemplate = {
                ...fullTemplate,
                ...template
            };
        }

        return fullTemplate;
    }
    private isArrayTemplate(template: IFullTemplate) {
        return /\[\]/.test(template.$path);
    }
}