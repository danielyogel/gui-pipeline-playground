import React from 'react';
import { Icon } from 'antd';
import { If, classNames } from 'react-extras';

import { VmType } from './ProductsListVM';

export default function({
  state: { userItems, selectedCategoryTab },
  computed: { backofficeItems, inCategoeyMode, inBackOffice },
  methods: { onEditRequest, onDelete, importFromBackoffice, selectCategoryTab }
}: VmType) {
  const TITLE_TEXT = 'Products';

  const isEmpty = backofficeItems.length === 0;
  const inApplicativeMode = inBackOffice === false;

  const NO_ITEMS = (
    <section className='flex justify-center pt-12'>
      <section>
        No <span className='capitalize'>{TITLE_TEXT}</span>
      </section>
    </section>
  );

  const ALL_LISTS = (
    <section className='h-full p-6'>
      <If condition={inApplicativeMode}>
        <section className='flex flex-wrap content-between justify-start items-start mb-12 pb-12 border-b-2 border-gray-600'>
          {userItems.map(item => (
            <div key={item.id} className='w-48 mr-6 mb-6 text-lg relative hover:bb-shadow-black group'>
              <img src={item.defaultMedia.url} alt={item.name} className='w-full h-40 p-2 object-contain block' />
              <section>
                <section className='flex justify-start items-center h-8 px-3 bg-bb-gray-opacity truncate'>
                  <b className='mr-1'>{item.details.brand.value}</b> {item.details.model.value}
                </section>
                <section className='flex justify-start items-center h-8 bg-bb-dark-purple px-3 text-white truncate'>
                  {item.name}
                </section>
                <section className='flex justify-center items-center h-8 px-3 bg-bb-gray-opacity truncate'>{item.price}</section>
              </section>

              <Icon
                onClick={e => onDelete(item.id)}
                type='delete'
                theme='filled'
                title='Remvoe'
                className='absolute color-red pointer text-bb-light-purple opacity-0 group-hover:opacity-100 bb-transition-all'
                style={{ top: '10px', right: '10px' }}
              />
              <div
                style={{ top: '10px', left: '10px' }}
                className='absolute bg-bb-dark-purple cursor-pointer text-white text-xs mr-2 border rounded-sm pl-1 pr-1 w-12 border-bb-dark-purple flex items-center justify-between opacity-0 group-hover:opacity-100 bb-transition-all'
                onClick={e => onEditRequest(item.id)}>
                <Icon type='edit' theme='filled' title='Edit' />
                <span>Edit</span>
              </div>
            </div>
          ))}
        </section>
      </If>

      <section className='flex'>
        <div className='flex-grow'>
          {backofficeItems.map(({ categoryName, products }) => {
            const NO_PRODUCTS = <span>No Items</span>;

            const PRODUCT_LIST = (
              <section className='flex flex-wrap content-between justify-start items-start'>
                {products.map(item => (
                  <div
                    key={item.id}
                    onClick={() => importFromBackoffice(item.id)}
                    className='w-48 mr-6 mb-6 text-lg relative hover:bb-shadow-black group'>
                    <img src={item.defaultMedia.url} alt={item.name} className='w-full h-40 p-2 object-contain block' />
                    <section>
                      <section className='flex justify-start items-center h-8 px-3 bg-bb-gray-opacity truncate'>
                        <b className='mr-1'>{item.details.brand.value}</b> {item.details.model.value}
                      </section>
                      <section className='flex justify-start items-center h-8 bg-bb-dark-purple px-3 text-white truncate'>
                        {item.name}
                      </section>
                      <section className='flex justify-center items-center h-8 px-3 bg-bb-gray-opacity truncate'>
                        {item.price}
                      </section>
                    </section>

                    <Icon
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      type='delete'
                      theme='filled'
                      title='Remvoe'
                      className='absolute color-red pointer text-bb-light-purple opacity-0 group-hover:opacity-100 bb-transition-all'
                      style={{ top: '10px', right: '10px' }}
                    />
                    <div
                      style={{ top: '10px', left: '10px' }}
                      className='absolute bg-bb-dark-purple cursor-pointer text-white text-xs mr-2 border rounded-sm pl-1 pr-1 w-12 border-bb-dark-purple flex items-center justify-between opacity-0 group-hover:opacity-100 bb-transition-all'
                      onClick={e => {
                        e.stopPropagation();
                        onEditRequest(item.id);
                      }}>
                      <Icon type='edit' theme='filled' title='Edit' />
                      <span>Edit</span>
                    </div>
                  </div>
                ))}
              </section>
            );

            return (
              <section
                key={categoryName}
                className={classNames('mb-10 last:mb-20 bb-slide-up', {
                  hidden: inCategoeyMode === false && selectedCategoryTab !== categoryName
                })}>
                <section>{products.length === 0 ? NO_PRODUCTS : PRODUCT_LIST}</section>
              </section>
            );
          })}
        </div>
        <If condition={inCategoeyMode === false}>
          <div className='flex-grow-0 w-24 flex-shrink-0'>
            {backofficeItems.map(({ categoryName }) => (
              <section
                key={categoryName}
                className={classNames('py-3 px-1 cursor-pointer', { 'font-bold': categoryName === selectedCategoryTab })}
                onClick={() => selectCategoryTab(categoryName)}>
                {categoryName}
              </section>
            ))}
          </div>
        </If>
      </section>
    </section>
  );

  return <>{isEmpty ? NO_ITEMS : ALL_LISTS}</>;
}
