export declare type TypeTemplate = IFullTemplate | string | Function;
export interface IFullTemplate {
    $path: string;
    $formatting: Function;
    [propName: string]: TypeTemplate;
}
export default class Json2json {
    private static PATH_SEPARATOR;
    private static PATH_ROOT;
    private template;
    private root;
    constructor(template: TypeTemplate);
    map(json: any): any;
    private mapChild(json, template);
    private getFullTemplate(template);
    private getPropertySafely(json, path?);
}
