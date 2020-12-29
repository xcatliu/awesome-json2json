import { Template, Json2jsonOptions, FormattingFunction } from './Json2json';
declare type AnyFunction = (...args: any[]) => any;
declare type Json2jsonReturnType<U> = U extends string ? U extends `${string}[]${string}` ? any[] : any : U extends FormattingFunction ? ReturnType<U> : {} extends {
    [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: any;
} ? U extends {
    $path: string;
    $formatting: FormattingFunction;
} ? U['$path'] extends `${string}[]${string}` ? ReturnType<U['$formatting']>[] : ReturnType<U['$formatting']> : U extends {
    $formatting: FormattingFunction;
} ? ReturnType<U['$formatting']> : U extends {
    $default: infer D;
} ? D extends AnyFunction ? ReturnType<D> : D : any : U extends {
    $path: string;
} ? U['$path'] extends `${string}[]${string}` ? {
    [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: Json2jsonReturnType<U[K]>;
}[] : {
    [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: Json2jsonReturnType<U[K]>;
} : {
    [K in Exclude<keyof U, '$path' | '$formatting' | '$disable' | '$default'>]: Json2jsonReturnType<U[K]>;
};
export default function json2json<T, U extends Template>(json: T, template: U, options?: Json2jsonOptions): Json2jsonReturnType<U>;
export { Template, Json2jsonOptions };
