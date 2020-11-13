import Json2json, { Template, Json2jsonOptions } from './Json2json';

export default function json2json(json: any, template: Template, options: Json2jsonOptions = {}) {
  const json2jsonInstance = new Json2json(template, options);
  return json2jsonInstance.transform(json);
}

export { Template, Json2jsonOptions };
