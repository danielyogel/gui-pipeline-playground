import * as t from 'io-ts';

export const TokenSchema = t.type({
  sub: t.string,
  exp: t.number,
  iat: t.number,
  auth: t.readonlyArray(t.string)
});
