import React from 'react';
import { observer } from 'mobx-react';

import HeadSectionView from './HeadSection';

import store from 'store';

export const HeadSection = observer(() => {
  const params = { SignupLink: store.router.link.SIGNUP };

  return <HeadSectionView {...params} />;
});
