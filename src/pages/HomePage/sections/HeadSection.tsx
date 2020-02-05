import style from '../HomePage.module.scss';
import React from 'react';

type Params = {
  SignupLink: React.FunctionComponent;
};

function HeadSectionView({ SignupLink }: Params) {
  return (
    <section className={style['head']}>
      <div className={style['head-group']}>
        <img src="/Logo-WT.png" alt="logo" />
        <h1>
          End to end indoor digital signage solution <br/> for product advertisement
          <small>Enables you to easily create and publish advertisements to digital screens</small>
        </h1>
        <SignupLink />
      </div>
    </section>
  );
}

export default HeadSectionView;
