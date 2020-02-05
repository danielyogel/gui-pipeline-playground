import React from 'react';
import TemplateEditor from 'components/template-editor/template-editor';
import { VmViewType as CategoryVmType } from './categoeryEditVM';

type TemplateListParams = {
  title: string;
  items: CategoryVmType['computed']['draftTemplates'] | CategoryVmType['computed']['publishedTemplates'];
  selectTemplate: (id: string) => void;
};
export function TemplateList({ title, items, selectTemplate }: TemplateListParams) {
  return (
    <section>
      <section className='font-bold text-lg'>{title}</section>
      <section className='flex items-start justify-start mb-6 flex-wrap'>
        {!items.length ? (
          <section className='text-center my-3'>No Items</section>
        ) : (
          items.map(currTemplate => {
            const onSelection = selectTemplate.bind(null, currTemplate.state.content.gui_id);
            return (
              <section
                onClick={onSelection}
                className='w-64 flex-shrink-0 bb-shadow-black hover:bb-shadow-black cursor-pointer overflow-hidden my-6 mr-6'
                key={currTemplate.state.id}>
                <TemplateEditor {...currTemplate} computed={currTemplate.computed.get()} viewMode={true} />
              </section>
            );
          })
        )}
      </section>
    </section>
  );
}
