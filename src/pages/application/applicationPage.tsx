import React from 'react';
import ApplicationHeader from 'pages/application/application-header';
import ApplicationSideBar from 'pages/application/application-sidebar';
import ProductsPage from 'pages/application/products';
import CategoeryEdit from 'pages/application/catagories/CategoryEdit';
import { ViewVmType } from './Application';
import store from 'store';

export default function View({
  computed: { selectedPage, userName, selectedCategoryId, unDeletedCategories, isVisible, shouldOpenSideBar, userVisibility },
  methods: { navigate, logOut, toggleSideBar },
  children: { licenses, devices, stickers, backgrounds, templates, campaigns, userProfile, categoryList, categoeyNew }
}: ViewVmType) {
  if (!isVisible) return null;

  const categoryVM = store.categoryList.computed.get().selectedCategory; //TODO: categoryVM should be internal of the list, which will decide if to render it

  return (
    <section className='h-full' style={{ minWidth: '1250px' }}>
      <section style={{ height: '60px' }}>
        <ApplicationHeader toProfile={() => navigate['APP.PROFILE']()} logout={logOut} userName={userName || ''} />
      </section>
      <section className='w-full relative overflow-hidden' style={{ height: 'calc(100% - 60px)' }}>
        <div style={{ width: '200px' }} className='h-full shadow-inner'>
          <ApplicationSideBar
            mode={userVisibility}
            onKey={navigate}
            currKey={selectedPage}
            categories={unDeletedCategories}
            currCategory={selectedCategoryId}
            isBarOpen={shouldOpenSideBar}
            toggleBar={toggleSideBar}
          />
        </div>

        <div
          className='absolute top-0 left-0 right-0 bottom-0 bb-sidebar-transition bg-white shadow-xl'
          style={{ left: shouldOpenSideBar ? '200px' : '48px' }}>
          {categoryVM && <CategoeryEdit {...categoryVM} computed={categoryVM.computed.get()}></CategoeryEdit>}
          <ProductsPage />

          <categoeyNew.Render />
          <categoryList.Render />
          <userProfile.Render />
          <campaigns.Render />
          <templates.Render />
          <backgrounds.Render />
          <stickers.Render />
          <licenses.Render />
          <devices.Render />
        </div>
      </section>
    </section>
  );
}
