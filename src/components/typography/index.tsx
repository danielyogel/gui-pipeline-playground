import React, { FC } from 'react';

export const Header1: FC<{}> = function({ children }) {
  return <h1 className='text-2xl mb-4 font-bold'>{children}</h1>;
};

export const Header2: FC<{}> = function({ children }) {
  return <h1 className='text-xl mb-3 font-bold'>{children}</h1>;
};
