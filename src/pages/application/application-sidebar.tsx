import React, { useState, FC } from 'react';
import { classNames, If } from 'react-extras';
import { Icon } from 'antd';
import { ViewVmType as VM } from './Application';
import { RouterType } from 'store';
type Computed = VM['computed'];
type Methods = VM['methods'];

type Params = {
  mode: Computed['userVisibility'];
  currKey: Computed['selectedPage'];
  onKey: RouterType['navigate'];
  currCategory: Computed['selectedCategoryId'];
  categories: Computed['unDeletedCategories'];
  isBarOpen: Computed['shouldOpenSideBar'];
  toggleBar: Methods['toggleSideBar'];
};

export default function({ mode, onKey, currKey, categories, currCategory, isBarOpen, toggleBar }: Params) {
  const HEADER = (
    <section
      className='h-12 flex justify-center items-center cursor-pointer bb-transition-all bg-blue-600 relative'
      onClick={() => toggleBar()}>
      <div className='font-bold text-text-base text-white'>
        {isBarOpen && <span>{mode === 'PLATFORM' ? 'Back Office' : 'Applicative'}</span>}
      </div>
      <Icon
        type='double-right'
        className='align-text-bottom text-lg absolute top-0 mt-4 bb-transition-all text-white'
        style={{
          transform: isBarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          left: '18px'
        }}
      />
    </section>
  );

  const LINKS = (
    <>
      <If condition={mode === 'USER'}>
        <LinkRow onClick={onKey['APP.CAMPAIGNS']} text='APP.CAMPAIGNS' icon='fire' isSelected={currKey === 'CAMPAIGNS'} />
        <LinkRow onClick={onKey['APP.TEMPLATES']} text='APP.TEMPLATES' icon='code-sandbox' isSelected={currKey === 'TEMPLATES'} />
      </If>

      <If condition={mode === 'PLATFORM'}>
        <section>
          <LinkRow onClick={onKey['APP.CATEGORY']} text='APP.CATEGORY' icon='appstore' isSelected={currKey === 'CATEGORY'} />
          <If condition={isBarOpen}>
            {categories.map(({ id, name }) => (
              <div
                onClick={e => {
                  e.stopPropagation();
                  onKey['APP.CATEGORY.EDIT']({ id: String(id) });
                }}
                key={id}
                className={classNames('cursor-pointer pl-12 pt-2 pr-3 truncate', {
                  'text-blue-400': currCategory === String(id)
                })}>
                {name}
              </div>
            ))}
          </If>
        </section>
      </If>

      <LinkRow onClick={onKey['APP.PRODUCTS']} text='APP.PRODUCTS' icon='shopping-cart' isSelected={currKey === 'PRODUCTS'} />
      <If condition={mode === 'PLATFORM'}>
        <LinkRow onClick={onKey['APP.LICENSES']} text='APP.LICENSES' icon='security-scan' isSelected={currKey === 'LICENSES'} />
      </If>
      <If condition={mode === 'USER'}>
        <LinkRow onClick={onKey['APP.DEVICES']} text='APP.DEVICES' icon='api' isSelected={currKey === 'DEVICES'} />
      </If>

      <LinkRow onClick={onKey['APP.BACKGROUNDS']} text='APP.BACKGROUNDS' icon='picture' isSelected={currKey === 'BACKGROUNDS'} />
      <LinkRow onClick={onKey['APP.STICKERS']} text='APP.STICKERS' icon='shop' isSelected={currKey === 'STICKERS'} />
    </>
  );

  return (
    <aside className='h-full pb-12 bb-background-gardient-four shadow-inner'>
      {HEADER} {LINKS}
    </aside>
  );
}

// INTERNALS
const LinkRow: FC<{ text: string; isSelected: boolean; icon: string; onClick: () => void }> = ({
  text,
  icon,
  isSelected,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <section
      className={classNames('h-12 flex items-center cursor-pointer bb-transition-all', {
        'bg-white': isSelected,
        shadow: isSelected
      })}
      onClick={() => onClick()}
      onMouseLeave={setIsHovered.bind(null, false)}
      onMouseEnter={setIsHovered.bind(null, true)}>
      <div className={classNames('h-full w-2', { 'bb-background-gardient-two': isSelected || isHovered })} />
      <Icon type={icon} className='ml-2 mr-3 text-blue text-xl' />
      <div className='font-bold text-text-base capitalize'>{text.replace('APP.', '').toLowerCase()}</div>
    </section>
  );
};
