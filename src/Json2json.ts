interface Context {
  $root: any;
  $item?: any;
  $index?: any;
}

export type Template = FullTemplate | string | Function;

interface FullTemplate {
  $path?: string;
  $formatting?: Function;
  $disable?: Function;
  $default?: any;
  [propName: string]: Template;
}

export interface Json2jsonOptions {
  clearEmpty?: boolean;
}

export default class Json2json {
  private static DISABLED_FIELD = '__DISABLED_FIELD__';
  public static clearEmpty = (json) => {
    if (typeof json === 'undefined' || json === null) {
      return undefined;
    }
    if (Array.isArray(json)) {
      const clearedJSON = json.map(Json2json.clearEmpty).filter((jsonItem) => jsonItem !== undefined);
      if (clearedJSON.length === 0) return undefined;
      return clearedJSON;
    }
    if (typeof json === 'object') {
      const clearedJSON = Object.keys(json).reduce((prev, key) => {
        const clearedJSONItem = Json2json.clearEmpty(json[key]);
        if (typeof clearedJSONItem === 'undefined') return prev;
        return {
          ...prev,
          [key]: clearedJSONItem,
        };
      }, {});
      if (Object.keys(clearedJSON).length === 0) return undefined;
      return clearedJSON;
    }
    return json;
  };
  private template: Template;
  private options: Json2jsonOptions;
  private root;
  public constructor(template: Template, options: Json2jsonOptions = {}) {
    this.template = template;
    this.options = options;
  }
  public transform(json) {
    this.root = json;
    const result = this.transformChild(json, this.template, { $root: this.root });
    if (this.options.clearEmpty) {
      return Json2json.clearEmpty(result);
    }
    return result;
  }
  private transformChild(json, template: Template, context: Context) {
    const fullTemplate = this.getFullTemplate(template);
    let currentJSON = this.getJSONByPath(json, fullTemplate.$path, context);

    if (fullTemplate.$disable) {
      if (this.isArrayTemplate(fullTemplate)) {
        currentJSON = currentJSON.filter((currentJSONItem) => {
          return !fullTemplate.$disable(currentJSONItem, {
            ...context,
            $item: currentJSONItem,
          });
        });
      } else {
        if (fullTemplate.$disable(currentJSON, context)) {
          return Json2json.DISABLED_FIELD;
        }
      }
    }

    if (!fullTemplate.$formatting && fullTemplate.$default) {
      const defaultFunction =
        typeof fullTemplate.$default === 'function' ? fullTemplate.$default : () => fullTemplate.$default;

      fullTemplate.$formatting = (val) => (typeof val === 'undefined' ? defaultFunction() : val);
    }

    if (fullTemplate.$formatting) {
      if (this.isArrayTemplate(fullTemplate)) {
        currentJSON = currentJSON.map((currentJSONItem) => {
          return fullTemplate.$formatting(currentJSONItem, {
            ...context,
            $item: currentJSONItem,
          });
        });
      } else {
        currentJSON = fullTemplate.$formatting(currentJSON, context);
      }
    }

    if (Object.keys(fullTemplate).some((key) => !/^\$/.test(key))) {
      return this.getFilteredJSON(currentJSON, fullTemplate, context);
    } else {
      return currentJSON;
    }
  }
  private getFilteredJSON(currentJSON, fullTemplate: FullTemplate, context: Context) {
    const filteredKeys = Object.keys(fullTemplate).filter((key) => !/^\$/.test(key));

    if (this.isArrayTemplate(fullTemplate)) {
      let index = 0;
      return currentJSON.map((currentJSONItem) => {
        let result = {};
        filteredKeys.forEach((key) => {
          const childResult = this.transformChild(currentJSONItem, fullTemplate[key], {
            ...context,
            $item: currentJSONItem,
            $index: index,
          });
          if (childResult !== Json2json.DISABLED_FIELD) {
            result[key] = childResult;
          }
          index += 1;
        });
        return result;
      });
    }

    let result = {};
    filteredKeys.forEach((key) => {
      const childResult = this.transformChild(currentJSON, fullTemplate[key], context);
      if (childResult !== Json2json.DISABLED_FIELD) {
        result[key] = childResult;
      }
    });
    return result;
  }
  // { new_field1: 'field1?.field2?.field3' }
  // Syntax reference https://github.com/tc39/proposal-optional-chaining
  private getJSONByPath(json, path: string | string[], context: Context) {
    if (path === '' || path.length === 0) return json;
    const splitPath = Array.isArray(path) ? path.slice() : path.split('.');
    if (splitPath[0] === '$root') {
      splitPath.shift();
      return this.getJSONByPath(this.root, splitPath, context);
    }
    if (splitPath[0] === '$item') {
      splitPath.shift();
      return this.getJSONByPath(context.$item, splitPath, context);
    }
    let result = json;
    while (splitPath.length > 0) {
      let currentKey = splitPath.shift();
      if (currentKey === '$head') {
        result = result[0] ?? null;
        continue;
      }
      if (/\[\]$/.test(currentKey)) {
        currentKey = currentKey.replace(/\[\]$/, '');
        if (/\?$/.test(currentKey)) {
          currentKey = currentKey.replace(/\?$/, '');
          if (typeof result[currentKey] === 'undefined') {
            return [];
          }
        }
        result = currentKey === '' ? result : result[currentKey];
        return result.map((jsonItem) => {
          return this.getJSONByPath(jsonItem, splitPath, {
            ...context,
            $item: jsonItem,
          });
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
  private getFullTemplate(template: Template) {
    let fullTemplate: FullTemplate = {
      $path: '',
    };

    if (typeof template === 'string') {
      fullTemplate.$path = template;
    } else if (typeof template === 'function') {
      fullTemplate.$formatting = template;
    } else if (typeof template === 'object') {
      fullTemplate = {
        ...fullTemplate,
        ...template,
      };
    }

    return fullTemplate;
  }
  private isArrayTemplate(template: FullTemplate) {
    return /\[\]/.test(template.$path);
  }
}
