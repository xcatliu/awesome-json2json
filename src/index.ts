import Json2json, { Template, Json2jsonOptions, FormattingFunction } from './Json2json';

type AnyFunction = (...args: any[]) => any;

type Json2jsonReturnType<U> = U extends string
  ? // if include [], then it's array
    U extends `${string}[]${string}`
    ? any[]
    : any
  : U extends FormattingFunction
  ? ReturnType<U>
  : // only have $path, $formatting, $disable and $default
  {} extends {
      [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: any;
    }
  ? // has $formatting, use $formatting type
    U extends {
      $path: string;
      $formatting: FormattingFunction;
    }
    ? U['$path'] extends `${string}[]${string}`
      ? ReturnType<U['$formatting']>[]
      : ReturnType<U['$formatting']>
    : U extends {
        $formatting: FormattingFunction;
      }
    ? ReturnType<U['$formatting']>
    : // don't have $formatting, try get $default type
    U extends {
        $default: infer D;
      }
    ? D extends AnyFunction
      ? ReturnType<D>
      : D
    : any
  : // have other keys
  U extends {
      $path: string;
    }
  ? U['$path'] extends `${string}[]${string}`
    ? {
        [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: Json2jsonReturnType<U[K]>;
      }[]
    : {
        [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: Json2jsonReturnType<U[K]>;
      }
  : {
      [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: Json2jsonReturnType<U[K]>;
    };

export default function json2json<T, U extends Template>(
  json: T,
  template: U,
  options: Json2jsonOptions = {},
): Json2jsonReturnType<U> {
  const json2jsonInstance = new Json2json(template, options);
  return json2jsonInstance.transform(json);
}

export { Template, Json2jsonOptions };
