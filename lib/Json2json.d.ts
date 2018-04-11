export declare type Template<T = any> = IFullTemplate<T> | string | Function;
export interface IFullTemplate<T = any> {
    $path?: string;
    $formatting?: Function;
    $disable?: Function;
    [propName: string]: Template<T>;
}
export default class Json2json<T> {
    private static PATH_SEPARATOR;
    private static PATH_ROOT;
    private static DISABLED_FIELD;
    private template;
    private root;
    constructor(template: Template<T>);
    map(json: any): any;
    private mapChild(json, template);
    private getFullTemplate(template);
    private getPropertySafely(json, path?);
}
