export interface Context {
    $root: any;
    $item?: any;
    $index?: any;
}
export declare type FormattingFunction = (val: any, context?: Context) => any;
export declare type DisableFunction = (val: any, context?: Context) => boolean;
export declare type Template = FullTemplate | string | FormattingFunction;
export interface FullTemplate {
    $path?: string;
    $formatting?: FormattingFunction;
    $disable?: DisableFunction;
    $default?: any;
    [propName: string]: Template;
}
export interface Json2jsonOptions {
    clearEmpty?: boolean;
}
export default class Json2json {
    private static DISABLED_FIELD;
    static clearEmpty: (json: any) => any;
    private template;
    private options;
    private root;
    constructor(template: Template, options?: Json2jsonOptions);
    transform(json: any): any;
    private transformChild;
    private getFilteredJSON;
    private getJSONByPath;
    private getFullTemplate;
    private isArrayTemplate;
}
