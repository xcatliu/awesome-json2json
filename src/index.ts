import Json2json, { Template } from './Json2json';

export default function json2json<T>(json: any, template: Template<T>) {
    const mapper = new Json2json(template);
    return mapper.map(json);
}

export {
    Template
}
