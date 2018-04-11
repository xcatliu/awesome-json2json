export type Template<T = any> = IFullTemplate<T> | string | Function;

export interface IFullTemplate<T = any> {
    $path?: string;
    $formatting?: Function;
    $disable?: Function;
    [propName: string]: Template<T>;
}

export default class Json2json<T> {
    private static PATH_SEPARATOR = '.';
    private static PATH_ROOT = '$root';
    private static DISABLED_FIELD = '__DISABLED_FIELD__';
    private template: Template<T>;
    private root: any;
    constructor(template: Template<T>) {
        this.template = template;
    }
    public map(json: any) {
        this.root = json;
        return this.mapChild(json, this.template);
    }
    private mapChild(json: any, template: Template) {
        const fullTemplate = this.getFullTemplate(template);
        let currentJSON = json;
        currentJSON = this.getPropertySafely(currentJSON, fullTemplate.$path);

        if (fullTemplate.$disable) {
            if (fullTemplate.$disable(currentJSON)) {
                return Json2json.DISABLED_FIELD;
            }
        }
        
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