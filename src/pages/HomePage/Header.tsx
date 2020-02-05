import style from './Header.module.scss';
import React from 'react';
import { observer } from 'mobx-react';

import store from 'store';

type Params = {
  SignupLink: React.FunctionComponent;
  LoginLink: React.FunctionComponent;
};

function HeaderView({ SignupLink: SignUpLink, LoginLink }: Params) {
  return (
    <header className={style['header']}>
      <a href='/' className={style['logo']}>
        <img src='/Logo-WT.png' alt='logo' />
      </a>
      <nav>
        <a href='/#features'>features</a>
        <a href='/#team'>team</a>
        <a href='/#contact-us'>contact us</a>
      </nav>
      <nav className={style['right-nav']}>
        <LoginLink />
        <SignUpLink />
      </nav>
    </header>
  );
}

export default observer(() => {
  const params = { SignupLink: store.router.link.SIGNUP, LoginLink: store.router.link.LOGIN };

  return <HeaderView {...params} />;
});
