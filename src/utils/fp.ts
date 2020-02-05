// lodash functions
import _mapValues from 'lodash/mapValues';
import _omit from 'lodash/omit';
import _pick from 'lodash/pick';
import _pickBy from 'lodash/pickBy';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';
import _isFunction from 'lodash/isFunction';
import deepmergeLib from 'deepmerge';

// FPTS TypeData
import * as Option from 'fp-ts/es6/Option';
import * as Either from 'fp-ts/es6/Either';
import * as Record from 'fp-ts/es6/Record';
import * as Array from 'fp-ts/es6/Array';
import * as NonEmptyArray from 'fp-ts/es6/NonEmptyArray';
import * as Ord from 'fp-ts/es6/Ord';

// FPTS Functions and utilities
import * as pipeable from 'fp-ts/es6/pipeable';

// FPTS Functions and utilities
import * as func from 'fp-ts/es6/function';

// FP-TS FUNCTIONS
const { pipe } = pipeable;
const { flow } = func;
const { isRight } = Either;
export { Option, Either, flow, pipeable, pipe, func, Array, NonEmptyArray, Record, isRight, Ord };

//  LODASH FUNCTIONS
export const mapValues = _mapValues;
export const deepEqual = _isEqual;
export const omit = _omit;
export const pick = _pick;
export const pickBy = _pickBy;
export const isFunction = _isFunction;
export const merge = <A, B>(a: A, b: B) => _merge({}, a, b);

//  OTHER FUNCTIONS
export const deepmerge = deepmergeLib;

export function arraymove<T>(arr: Array<T>, fromIndex: number, toIndex: number) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
  return arr;
}
