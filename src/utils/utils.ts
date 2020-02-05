import { Merge } from 'type-fest';
import { IComputedValue, IObservableValue } from 'mobx';
import JWT from 'jwt-decode';
import { Either, Right, isLeft } from 'fp-ts/es6/Either';
import { TokenSchema } from 'schemas/token-content-schema';

export type UnWrapComputed<T extends IComputedValue<any>> = T extends IComputedValue<infer U> ? U : never;
export type UnWrapObservable<T extends IObservableValue<any>> = T extends IObservableValue<infer U> ? U : never;

export type GetVmType<V extends (a: any) => { [k: string]: any; computed: IComputedValue<any>; init?: any }> = Omit<
  Merge<ReturnType<V>, { computed: UnWrapComputed<ReturnType<V>['computed']> }>,
  'init'
>;

export type GetVmTypeFull<V extends (a: any) => { [k: string]: any; state: IObservableValue<any>; computed: IComputedValue<any>; init?: any }> = Omit<
  Merge<ReturnType<V>, { state: UnWrapObservable<ReturnType<V>['state']>; computed: UnWrapComputed<ReturnType<V>['computed']> }>,
  'init'
>;

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

export function generateId() {
  return Math.floor(Math.random() * 16777215).toString(16);
}

export function generateRandomColor() {
  var x = Math.floor(Math.random() * 256);
  var y = Math.floor(Math.random() * 256);
  var z = Math.floor(Math.random() * 256);
  return 'rgb(' + x + ',' + y + ',' + z + ')';
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function notLeft<T>(x: Either<unknown, T>): x is Right<T> {
  return isLeft(x) === false;
}

export function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  const acc = Object.create(null);
  return o.reduce((res, key) => ({ ...res, [key]: key }), acc);
}

export function parseAndValidateToken(token: string) {
  const parsedToken = JWT(token);
  return TokenSchema.decode(parsedToken);
}

export function isPlainObject(o: unknown): o is Record<string, unknown> {
  return !!o && typeof o === 'object' && Object.prototype.toString.call(o) === '[object Object]';
}
