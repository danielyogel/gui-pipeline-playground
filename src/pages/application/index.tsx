import React from 'react';
import { observer } from 'mobx-react';

import store from 'store';
import ApplicationPage from './applicationPage';

const { applicationPageVM } = store;

const Page = observer(ApplicationPage);

export default observer(() => {
  return <Page {...applicationPageVM} computed={applicationPageVM.computed.get()} />;
});
