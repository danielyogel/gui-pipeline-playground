import React from 'react';
import Input from 'antd/lib/input';
import { InputNumber } from 'antd';

const { TextArea } = Input;

type params = {
  value: string | undefined;
  onChange: (arg0: string) => void;
  placeholder: string;
  type?: string;
  title?: string;
};

export const StringRow = ({ onChange, value, placeholder, type }: params) => (
  <section>
    <div>
      <span className='capitalize'>{placeholder}</span>
    </div>
    <div>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type ? type : 'text'} autoComplete='on' />
    </div>
  </section>
);

export const InputTextBox = ({ onChange, value, title, placeholder }: params) => (
  <section>
    <div>
      <span className='capitalize'>{title}</span>
    </div>
    <div>
      <TextArea placeholder={placeholder} autoSize={{ minRows: 4, maxRows: 16 }} value={value} onChange={e => onChange(e.target.value)} autoComplete='on' />
    </div>
  </section>
);

type NumberParams = {
  value: number | undefined;
  onChange: (arg0: number) => void;
  placeholder: string;
};

export const NumberRow = ({ onChange, value, placeholder }: NumberParams) => (
  <section>
    <div>
      <span className='capitalize'>{placeholder}</span>
    </div>
    <div>
      <InputNumber min={1} max={10} defaultValue={3} value={value} onChange={value => onChange(value === undefined ? 0 : value)} />
    </div>
  </section>
);
