export declare type Template<T> = IFullTemplate<T> | string | Function;
export interface IFullTemplate<T> {
    $path?: string;
    $formatting?: Function;
    [propName: string]: Template<T>;
}
export default class Json2json<T> {
    private static PATH_SEPARATOR;
    private static PATH_ROOT;
    private template;
    private root;
    constructor(template: Template<T>);
    map(json: any): T;
    private mapChild(json, template);
    private getFullTemplate(template);
    private getPropertySafely(json, path?);
}
