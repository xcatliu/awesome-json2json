export interface IFormattingContext {
    $root: any;
    $item?: any;
}
export interface IFormattingFunction {
    (json: any, context?: IFormattingContext): any;
}
export declare type Template<T = any> = IFullTemplate<T> | string | IFormattingFunction;
export interface IFullTemplate<T = any> {
    $path?: string;
    $formatting?: IFormattingFunction;
    $disable?: IFormattingFunction;
    [propName: string]: Template;
}
export interface IJson2jsonOptions {
    clearEmpty?: boolean;
}
export default class Json2json<T> {
    private static DISABLED_FIELD;
    static clearEmpty: (json: any) => any;
    private template;
    private options;
    private root;
    constructor(template: Template<T>, options?: IJson2jsonOptions);
    map(json: any): any;
    private mapChild(json, template, context);
    private getFilteredJSON(currentJSON, fullTemplate, context);
    private getJSONByPath(json, path, context);
    private getFullTemplate(template);
    private isArrayTemplate(template);
}
