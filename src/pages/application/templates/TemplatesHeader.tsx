import React from 'react';
import { classNames } from 'react-extras';

export default function() {
  return (
    <section className='h-12 p-6 flex items-center bg-gray-200'>
      <section className='cursor-pointer mr-3'>
        <span className={classNames({ capitalize: true, 'font-bold': true })}>Templates</span>
      </section>
    </section>
  );
}
