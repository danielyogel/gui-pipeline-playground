import * as t from 'io-ts';
import { Value, ValueJSON } from 'slate';
import { pipe } from 'fp-ts/es6/pipeable';
import { parseJSON, toError, fold } from 'fp-ts/es6/Either';
import { isPlainObject } from 'utils/utils';

export const SlateValueV = new t.Type<Value, ValueJSON, unknown>(
  'SlateValue' as const,
  (input): input is Value => Value.isValue(input),
  (input, context) => {
    if (Value.isValue(input)) {
      return t.success(input);
    }

    if (typeof input === 'string') {
      return pipe(
        parseJSON(input, toError),
        fold(
          left => t.failure(input, context, left.message),
          right => (Value.isValue(right) ? t.success(right) : t.failure(input, context))
        )
      );
    }

    if (isPlainObject(input)) {
      try {
        return t.success(Value.fromJSON(input));
      } catch (e) {
        return t.failure(input, context, e);
      }
    }

    return t.failure(input, context);
  },
  slateValue => slateValue.toJS()
);
