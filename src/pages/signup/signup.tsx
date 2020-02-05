import React from 'react';
import { Modal, Icon, Input } from 'antd';
import { ApiServiceType } from 'store/abstract/ApiService';
import { State, View, Methods, Computed } from 'utils/Init';
import { UserSignup } from 'clientApi/api';
import { IComputedValue } from 'mobx';
import { pipe } from 'utils/fp';
import Logo from 'Icon-WT.png';

interface Params {
  isVisible: IComputedValue<boolean>;
  apiService: ApiServiceType;
  toLogin: () => void;
  toHome: () => void;
}

export default function({ apiService, toLogin, isVisible, toHome }: Params) {
  return pipe(
    State({
      details: { email: '', password: '', userName: '' }
    }),
    Computed(() => ({ isDisabled: false, isVisible: isVisible.get() })),
    Methods(({ state, clear, setState }) => ({
      toLogin,
      toHome,
      editDetails(changes: Partial<Required<UserSignup>>) {
        setState({ details: { ...state.get().details, ...changes } });
      },
      signup(): void {
        apiService
          .userApi()
          .signUpNewUser(state.get().details)
          .then(res => {
            Modal.success({
              title: 'Signup Success!',
              content: '1. click on the activation link from logs. 2. Login using the login page',
              onOk: () => {
                clear();
              }
            });
          })
          .catch(() => {
            Modal.error({ content: 'Signup Failed!' });
          });
      },
      clear
    })),
    View(({ state, methods, computed }) => {
      const { details } = state.get();
      const { isDisabled } = computed.get();
      const { editDetails, signup, toHome, toLogin } = methods;

      const HEADER = (
        <section className='bb-background-gardient-one text-white' style={{ height: '300px' }}>
          <section className='overflow-hidden relative' style={{ height: '200px' }}>
            <Icon type='home' className='absolute cursor-pointer text-lg' style={{ top: '20px', left: '20px' }} onClick={() => toHome()} />
            <img src={Logo} alt='Buildboard Logo' className='block h-full m-auto' />
          </section>
          <section className='text-center text-4xl py-6 flex-shrink-0 bb-fade-in-fast'>Create an Account</section>
        </section>
      );

      const FORM = (
        <section className='bb-slide-up'>
          <section className='flex items-center'>
            <Icon type='user' className='text-bb-dark-purple mr-3' />
            <Input value={details.userName} type='string' onChange={e => editDetails({ userName: e.target.value })} placeholder='Username'></Input>
          </section>

          <section className='flex items-center mt-5'>
            <Icon type='mail' className='text-bb-dark-purple mr-3' />
            <Input value={details.email} type='email' onChange={e => editDetails({ email: e.target.value })} placeholder='Email'></Input>
          </section>

          <section className='flex items-center mt-5'>
            <Icon type='lock' className='text-bb-dark-purple mr-3' />
            <Input value={details.password} type='password' onChange={e => editDetails({ password: e.target.value })} placeholder='Password'></Input>
          </section>
        </section>
      );

      const FOOTER = (
        <section className='flex flex-col justify-between items-center '>
          <section className='bb-background-gardient-one w-48 py-2 rounded text-center text-white cursor-pointer' onClick={() => !isDisabled && signup()}>
            Signup
          </section>

          <section className='mt-3'>
            <span className='mr-2'> Already signed?</span>
            <span className='cursor-pointer text-blue-500' onClick={() => toLogin()}>
              Login!
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
