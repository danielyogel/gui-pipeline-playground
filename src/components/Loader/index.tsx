import React from 'react';
import { Icon } from 'antd';

export function SectionLoader() {
  return (
    <section className='h-full flex justify-center items-center bb-slide-up'>
      <Icon type='loading' className='text-4xl relative' style={{ top: '-100px' }} />;
    </section>
  );
}
