import React from 'react';
import { observer } from 'mobx-react';

import ProductList from './ProductList/ProductList';
import { AppSubHeader } from 'pages/application/application-sub-header';
import ProductUpdateForm from './ProductForm/ProductForm';
import {} from './ProductsVM';
import store from 'store';

const { productsVM, productListVM, productPutVM } = store;

const UpdatePage = observer(ProductUpdateForm);
const ListPage = observer(ProductList);

const Main = observer(() => {
  const isList = productsVM.computed.get().currentView === 'LIST';
  const currentView = productsVM.computed.get().currentView;
  const backToList = productsVM.methods.backToList;
  const startCreate = productsVM.methods.startCreate;
  if (!productsVM.computed.get().isVisible) {
    return null;
  }

  return (
    <section className='h-full'>
      <AppSubHeader
        listName='products'
        createName='add'
        selectedView={currentView === 'LIST' ? 'LIST' : 'ITEM'}
        setView={v => (v === 'LIST' ? backToList() : startCreate())}
      />
      <section className='h-full overflow-y-scroll'>
        {isList ? (
          <ListPage {...productListVM} computed={productListVM.computed.get()} />
        ) : (
          <UpdatePage {...productPutVM} computed={productPutVM.computed.get()} />
        )}
      </section>
    </section>
  );
});

export default Main;
