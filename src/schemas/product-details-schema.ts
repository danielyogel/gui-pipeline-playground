import * as t from 'io-ts';
import { IntFromString } from 'io-ts-types/lib/IntFromString';

export const ProductDetailsSchema = t.type({
  weight: t.type({
    value: t.union([t.number, IntFromString]),
    unit: t.union([t.literal('kg'), t.literal('gr')])
  }),
  model: t.type({
    value: t.string,
    unit: t.null
  }),
  items: t.type({
    value: t.union([t.number, IntFromString]),
    unit: t.null
  }),
  dimension: t.type({
    value: t.number,
    unit: t.null
  }),
  size: t.type({
    value: t.string,
    unit: t.null
  }),
  colors: t.type({
    value: t.string,
    unit: t.null
  }),
  ingredients: t.type({
    value: t.string,
    unit: t.null
  }),
  brand: t.type({
    value: t.string,
    unit: t.null
  })
});

export type ProductDetailsType = t.TypeOf<typeof ProductDetailsSchema>;

export const defaultValue: ProductDetailsType = {
  weight: { unit: 'kg', value: 0 },
  model: { unit: null, value: '' },
  items: { unit: null, value: 0 },
  dimension: { unit: null, value: 0 },
  size: { unit: null, value: '' },
  colors: { unit: null, value: '' },
  ingredients: { unit: null, value: '' },
  brand: { unit: null, value: '' }
};
