import React from 'react';
import { Icon } from 'antd';

import logo from 'logo.png';

type Params = {
  toProfile: () => void;
  logout: () => void;
  userName: string;
};

export default ({ toProfile, logout, userName }: Params) => {
  return (
    <section className='h-full bb-background-gardient-one flex justify-center items-center relative'>
      <img src={logo} alt='Logo' className='w-56 ml-6 relative' style={{ top: '-3px' }} />
      <div className='flex items-center justify-center mr-6 h-full text-m text-white cursor-pointer absolute right-0' onClick={toProfile}>
        <span className='mr-1'>Welcome</span> <span className='font-bold'>{userName}</span>
        <Icon className='text-white mr-3 ml-3 cursor-pointer text-2xl relative' style={{ top: '-2px' }} type='user' />
        <span
          onClick={e => {
            e.stopPropagation();
            logout();
          }}>
          Logout
        </span>
      </div>
    </section>
  );
};
