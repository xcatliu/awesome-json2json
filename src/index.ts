import Json2json, { Template, IJson2jsonOptions } from './Json2json';

export default function json2json<T>(json: any, template: Template<T>, options: IJson2jsonOptions = {}) {
    const mapper = new Json2json(template, options);
    return mapper.map(json);
}

export {
    Template,
    IJson2jsonOptions
}
