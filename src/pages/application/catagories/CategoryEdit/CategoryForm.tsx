import React from 'react';
import TextArea from 'antd/lib/input/TextArea';
import { Icon, Input } from 'antd';
import { VmViewType } from './categoeryEditVM';

type RenderFormParams = {
  categoryForm: VmViewType['state']['categoryForm'];
  onFormChange: VmViewType['methods']['onFormChange'];
};

export function RenderForm({ categoryForm, onFormChange }: RenderFormParams) {
  const descriptionInputRef = React.useRef<TextArea>(null);
  return (
    <section>
      <section className='font-bold text-lg cursor-pointer mb-1' onClick={() => descriptionInputRef.current && descriptionInputRef.current.focus()}>
        <span>Description</span>
        <Icon type='edit' theme='filled' className='align-middle ml-1 text-base' />
      </section>
      <Input.TextArea
        ref={descriptionInputRef}
        placeholder='Some details about the new category'
        autoSize={{ minRows: 2, maxRows: 16 }}
        value={categoryForm.description}
        onChange={e => onFormChange({ description: e.target.value })}
        className='outline-none border-none p-2 -ml-2'
      />
    </section>
  );
}
