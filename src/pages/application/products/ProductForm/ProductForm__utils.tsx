import React from 'react';
import { classNames, If } from 'react-extras';
import { Icon } from 'antd';

import {} from './ProductFormVM';

export const SmallImageContainer = ({ children, isSelected }: { children: React.ReactNode; isSelected?: boolean }) => (
  <div
    className={classNames('h-16 w-16 m-1 flex items-center justify-center rounded-lg border-2 border-solid relative', {
      'border-green-600': isSelected
    })}>
    {children}
    <If condition={isSelected === true}>
      <span className='absolute text-xl' style={{ top: '-25%', left: '-8%' }}>
        <Icon type='check-circle' theme='filled' className='text-green-600' />
      </span>
    </If>
  </div>
);

export const FooterButton = ({ onClick, className, text }: { text: string; onClick: () => void } & React.HTMLAttributes<HTMLLabelElement>) => (
  <div onClick={onClick} className={'flex justify-center items-center h-6 p-2 mr-2 rounded ' + className}>
    {text}
  </div>
);
