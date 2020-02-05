import React from 'react';
import { Icon } from 'antd';
import { classNames } from 'react-extras';
import InfiniteScroll from 'react-infinite-scroll-component';

type Item = {
  name: string;
  id: number;
  url: string | null;
};

type Params = {
  title: string;
  items: Item[];
  onDelete?: (id: number) => void;
  onSelect?: (id: number) => void;
  isLast?: boolean | null;
  onNext?: () => void;
};

export default function({ items, onDelete, title, onSelect, onNext, isLast }: Params) {
  const LIST = (
    <>
      <InfiniteScroll
        height='470px'
        className='flex flex-wrap content-start p-6'
        dataLength={items.length} //This is important field to render the next data
        next={() => {
          return onNext && onNext();
        }}
        hasMore={isLast === false}
        loader={<h4>Loading...</h4>}
        endMessage={
          <div className='flex justify-center items-center h-48 w-48'>
            <b>Yay! You have seen it all</b>
          </div>
        }>
        {items.map(item => (
          <RenderItem
            item={item}
            onDelete={onDelete && onDelete.bind(null, item.id)}
            onSelect={onSelect}
            key={item.id}></RenderItem>
        ))}
      </InfiniteScroll>
    </>
  );

  const NO_ITEMS = (
    <section>
      No <span className='capitalize'>{title}</span>
    </section>
  );

  return (
    <section className='h-full'>
      {items.length ? LIST : <section className='flex justify-center pt-12'>{NO_ITEMS}</section>}
    </section>
  );
}

//
//  INTERNALS
//
type RenterItemParams = {
  item: Item;
  onDelete?: () => void;
  onSelect?: (id: number) => void;
};

function RenderItem({ item, onDelete, onSelect }: RenterItemParams) {
  const { name, id, url } = item;
  const shouldShowPointer = !!onSelect;

  return (
    <div
      onClick={onSelect && onSelect.bind(null, id)}
      key={id}
      className={classNames('w-48 h-48 mr-6 mt-6 flex items-center justify-center hover:bb-shadow-black relative', {
        'cursor-pointer': shouldShowPointer
      })}>
      {url && <img src={url} alt={name} className='block w-full h-full object-cover' />}

      <section
        className='absolute flex items-center justify-between bg-bb-gray-opacity px-3 w-full overflow-hidden h-8'
        style={{ left: 0, right: 0, bottom: 0 }}>
        <div title={name} style={{ width: 'calc(100% - 2rem)' }} className='flex justify-start items-center'>
          <span className='truncate text-lg font-bold'> {name}</span>
        </div>

        {onDelete && (
          <div
            className='text-black text-center cursor-pointer opacity-100 w-4 flex-shrink-0'
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            title='Delete'>
            <Icon
              type='delete'
              theme='filled'
              className='text-bb-light-purple text-lg hover:text-bb-dark-purple'
              style={{ transition: 'color 0.2s ease-in-out' }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
