import React from 'react';
import { Input, Icon } from 'antd';
import { Modal } from 'antd';
import { IComputedValue } from 'mobx';
import { Either, pipe } from 'utils/fp';
import Logo from 'Icon-WT.png';

import { State, View, Run, Methods, Computed } from 'utils/Init';
import Profile from 'store/abstract/profileVM';
import { ApiServiceType } from 'store/abstract/ApiService';

type Params = {
  apiService: ApiServiceType;
  profileVM: ReturnType<typeof Profile>;
  toSignup: () => void;
  toHome: () => void;
  isVisible: IComputedValue<boolean>;
};

export default function({ isVisible, apiService, profileVM, toSignup, toHome }: Params) {
  return pipe(
    State({
      details: { email: '', password: '' }
    }),
    Computed(() => ({ isDisabled: false, isVisible: isVisible.get() })),
    Methods(({ state, initialState, setState }) => ({
      toSignup,
      toHome,
      onChange(changes: Partial<typeof initialState.details>) {
        setState({ details: { ...state.get().details, ...changes } });
      },
      login() {
        apiService
          .userApi()
          .login(state.get().details)
          .then(({ data: { token } }) =>
            pipe(
              profileVM.methods.login(token),
              Either.fold(
                e => {
                  throw e;
                },
                () =>
                  Modal.success({
                    content: 'Login Success!'
                  })
              )
            )
          )
          .catch(e => {
            console.log({ e });
            return Modal.error({ content: 'Login Failed!' });
          });
      }
    })),
    Run(({ clear }) => {
      isVisible.observe(c => {
        if (c.newValue && !c.oldValue) clear();
      });
    }),
    View(({ state, computed, methods }) => {
      const { details } = state.get();
      const { isDisabled } = computed.get();
      const { login, onChange, toSignup, toHome } = methods;

      const HEADER = (
        <section className='bb-background-gardient-one text-white' style={{ height: '300px' }}>
          <section className='overflow-hidden relative' style={{ height: '200px' }}>
            <Icon type='home' className='absolute cursor-pointer text-lg' style={{ top: '20px', left: '20px' }} onClick={() => toHome()} />
            <img src={Logo} alt='Buildboard Logo' className='block h-full m-auto' />
          </section>
          <section className='text-center text-4xl py-6 flex-shrink-0 bb-fade-in-fast'>Login</section>
        </section>
      );

      const FORM = (
        <section className='bb-slide-up'>
          <section className='flex items-center'>
            <Icon type='mail' className='text-bb-dark-purple mr-3' />
            <Input value={details.email} type='email' onChange={e => onChange({ email: e.target.value })} placeholder='Email'></Input>
          </section>

          <section className='flex items-center mt-5'>
            <Icon type='lock' className='text-bb-dark-purple mr-3' />
            <Input value={details.password} type='password' onChange={e => onChange({ password: e.target.value })} placeholder='Password'></Input>
          </section>
        </section>
      );

      const FOOTER = (
        <section className='flex flex-col justify-between items-center '>
          <section className='bb-background-gardient-one w-48 py-2 rounded text-center text-white cursor-pointer' onClick={() => !isDisabled && login()}>
            Login
          </section>

          <section className='mt-3'>
            <span className='mr-2'> Not Registed ?</span>
            <span className='cursor-pointer text-blue-500' onClick={() => toSignup()}>
              Signup!
            </span>
          </section>
        </section>
      );

      return (
        <section>
          {HEADER}
          <section className='w-9/12 lg:w-4/12 mx-auto my-10'>
            {FORM}
            <section className='my-6'>{FOOTER}</section>
          </section>
        </section>
      );
    })
  );
}
