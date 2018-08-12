export declare type Template<T = any> = IFullTemplate<T> | string | Function;
export interface IFullTemplate<T = any> {
    $path?: string;
    $formatting?: Function;
    $disable?: Function;
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
    private mapChild;
    private getFilteredJSON;
    private getJSONByPath;
    private getFullTemplate;
    private isArrayTemplate;
}
