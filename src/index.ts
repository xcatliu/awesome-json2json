import Json2json, { TypeTemplate } from './Json2json';

export default function json2json(json: any, template: TypeTemplate) {
    const mapper = new Json2json(template);
    return mapper.map(json);
}