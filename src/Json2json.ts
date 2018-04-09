export type TypeTemplate = IFullTemplate | string | Function;

export interface IFullTemplate {
    $path?: string;
    $formatting?: Function;
    [propName: string]: TypeTemplate;
}

export default class Json2json {
    private static PATH_SEPARATOR = '.';
    private static PATH_ROOT = '$root';
    private template: TypeTemplate;
    private root: any;
    constructor(template: TypeTemplate) {
        this.template = template;
    }
    public map(json: any) {
        this.root = json;

        return this.mapChild(json, this.template);
    }
    private mapChild(json: any, template: TypeTemplate) {
        const fullTemplate = this.getFullTemplate(template);
        let currentJSON = json;
        currentJSON = this.getPropertySafely(currentJSON, fullTemplate.$path);
        if (fullTemplate.$formatting) {
            if (/\[\]/.test(fullTemplate.$path)) {
                currentJSON = currentJSON.map((currentJSONItem) => fullTemplate.$formatting(currentJSONItem));
            } else {
                currentJSON = fullTemplate.$formatting(currentJSON);
            }
        }

        const filteredKeys = Object.keys(fullTemplate).filter((key) => !(/^\$/.test(key)));
        if (filteredKeys.length === 0) {
            return currentJSON;
        }

        if (/\[\]/.test(fullTemplate.$path)) {
            return currentJSON.map((currentJSONItem) => {
                let result = {};
                filteredKeys.forEach((key) => {
                    result[key] = this.mapChild(currentJSONItem, fullTemplate[key]);
                });
                return result;
            });
        }

        let result = {};
        filteredKeys.forEach((key) => {
            result[key] = this.mapChild(currentJSON, fullTemplate[key]);
        });
        return result;
    }
    private getFullTemplate(template: TypeTemplate) {
        let fullTemplate: IFullTemplate = {
            $path: '',
            $formatting: null
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
    // { new_field1: 'field1?.field2?.field3' }
    // 语法参考 https://github.com/tc39/proposal-optional-chaining
    private getPropertySafely(json: any, path = '') {
        if (path === '') return json;
        const splitedPath = path.split(Json2json.PATH_SEPARATOR);
        if (splitedPath[0] === '$root') {
            splitedPath.shift();
            return this.getPropertySafely(this.root, splitedPath.join('.'));
        }
        let result = json;
        while (splitedPath.length > 0) {
            let currentKey = splitedPath.shift();
            if (/\[\]$/.test(currentKey)) {
                currentKey = currentKey.replace(/\[\]$/, '');
                result = currentKey === '' ? result : result[currentKey];
                const joinedPath = splitedPath.join('.');
                return result.map((jsonItem) => {
                    return this.getPropertySafely(jsonItem, joinedPath);
                });
            }
            if (/\?$/.test(currentKey)) {
                currentKey = currentKey.replace(/\?$/, '');
                if (typeof result[currentKey] === 'undefined') {
                    return undefined;
                }
            }
            result = result[currentKey];
        }
        return result;
    }
}