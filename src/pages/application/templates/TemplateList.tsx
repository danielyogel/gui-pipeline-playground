import React from 'react';
import { Choose } from 'react-extras';
import TemplateVM from 'components/template-editor/template-editor-vm';
import TemplateEditor from 'components/template-editor/template-editor';
import { Icon } from 'antd';

interface Params {
  title?: string;
  items: ReturnType<typeof TemplateVM>[];
  onSelect?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function({ items, onDelete, onSelect, title }: Params) {
  return (
    <section>
      <section className='text-lg'>{title || ''}</section>
      <section className='flex items-start justify-start mb-6 flex-wrap'>
        <Choose>
          <Choose.When condition={items.length > 0}>
            {items.map(currItem => {
              return (
                <section
                  {...(onSelect && { onClick: () => onSelect(currItem.state.id) })}
                  className='w-64 flex-shrink-0 bb-shadow-black hover:bb-shadow-black cursor-pointer overflow-hidden my-3 mr-6 relative group'
                  key={currItem.state.id}>
                  {onDelete && (
                    <Icon
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(currItem.state.id);
                      }}
                      type='delete'
                      theme='filled'
                      title='Remvoe'
                      className='absolute color-red pointer text-bb-light-purple opacity-0 group-hover:opacity-100 bb-transition-all z-10 text-xl'
                      style={{ top: '10px', right: '10px' }}
                    />
                  )}
                  <TemplateEditor {...currItem} computed={currItem.computed.get()} viewMode={true} />
                </section>
              );
            })}
          </Choose.When>
          <Choose.Otherwise>
            <section className='text-center text-lg my-3'>No Items</section>
          </Choose.Otherwise>
        </Choose>
      </section>
    </section>
  );
}
