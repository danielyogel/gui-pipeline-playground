import React from 'react';
import { Icon } from 'antd';
import { classNames } from 'react-extras';

type VIEW = 'LIST' | 'ITEM';

type Params = {
  listName: string;
  createName: string;
  selectedView: VIEW;
  setView: (v: VIEW) => void;
};

export function AppSubHeader({ listName, createName, setView, selectedView }: Params) {
  return (
    <section className='h-12 p-6 flex items-center bg-gray-200'>
      <section className='cursor-pointer mr-3' onClick={() => setView('LIST')}>
        <span className={classNames({ capitalize: true, 'font-bold': 'LIST' === selectedView })}>{listName}</span>
      </section>
      <section className='cursor-pointer mr-3' onClick={() => setView('ITEM')}>
        <span className={classNames({ capitalize: true, 'font-bold': 'ITEM' === selectedView })}>{createName}</span>
        <Icon type='plus' className='pl-1 align-middle' />
      </section>
    </section>
  );
}
