import style from './HomePage.module.scss';
import React from 'react';
import Header from './Header';
import { HeadSection } from './sections';
import MarketingSections from './sections/MarketingSections';
import TeamSection from './sections/TeamSection';
import Footer from './Footer';

import { observer } from 'mobx-react';
import store from 'store';

export default observer(() => {
  if (!store.router.activeNodes.HOMEPAGE.get()) {
    return null;
  }

  return (
    <>
      <Header />
      <main className={style['home-page']}>
        <HeadSection />
        <MarketingSections />
        <TeamSection />
      </main>
      <Footer />
    </>
  );
});
