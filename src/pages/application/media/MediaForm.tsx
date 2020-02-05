import React, { FC } from 'react';
import { Button, Select } from 'antd';
import { GetVmTypeFull } from 'utils/utils';
import MediaVM from './Media';
import { StringRow } from 'components/Inputs/CustomInputs';
import { Header2 } from 'components/typography';
import { IComputedValue } from 'mobx';
import { If } from 'react-extras';
type VM = GetVmTypeFull<typeof MediaVM>;

type MediaFormType = FC<{
  licenses: VM['state']['licenses'];
  isValid: VM['computed']['isValid'];
  formValue: VM['state']['formValue'];
  onChange: VM['methods']['onChange'];
  post: VM['methods']['post'];
  mode: IComputedValue<'USER' | 'PLATFORM' | null>;
}>;

export const MediaForm: MediaFormType = ({ formValue, onChange, post, licenses, isValid, mode }) => (
  <section>
    <section className='mb-6'>
      <input type='file' onChange={e => e.target.files && e.target.files.length && onChange({ file: e.target.files[0] })} />
    </section>

    <If condition={mode.get() === 'PLATFORM'}>
      <section className='max-w-3xl'>
        <Header2>Media Attribution</Header2>

        <section>
          <StringRow
            value={formValue.mediaAttribution.title}
            onChange={title => onChange({ mediaAttribution: { ...formValue.mediaAttribution, title } })}
            placeholder='title'
          />
        </section>

        <section>
          <StringRow
            value={formValue.mediaAttribution.source}
            onChange={source => onChange({ mediaAttribution: { ...formValue.mediaAttribution, source } })}
            placeholder='source'
          />
        </section>

        <section>
          <StringRow
            value={formValue.mediaAttribution.sourceUrl}
            onChange={sourceUrl => onChange({ mediaAttribution: { ...formValue.mediaAttribution, sourceUrl } })}
            placeholder='sourceUrl'
          />
        </section>

        <section>
          <StringRow
            value={formValue.mediaAttribution.author}
            onChange={author => onChange({ mediaAttribution: { ...formValue.mediaAttribution, author } })}
            placeholder='author'
          />
        </section>

        <section className='mb-6'>
          <StringRow
            value={formValue.mediaAttribution.authorUrl}
            onChange={authorUrl => onChange({ mediaAttribution: { ...formValue.mediaAttribution, authorUrl } })}
            placeholder='authorUrl'
          />
        </section>

        <section className='mb-6'>
          <section>License</section>
          <Select
            size='default'
            placeholder='Select License'
            value={formValue.mediaAttribution.license?.id}
            style={{ width: 140 }}
            onChange={(id: typeof licenses[0]['id']) => {
              const license = licenses.find(l => l.id === id);
              return onChange({ mediaAttribution: { ...formValue.mediaAttribution, license } });
            }}>
            {licenses.map(license => (
              <Select.Option key={license.id} value={license.id}>
                {license.licenseName}
              </Select.Option>
            ))}
          </Select>
        </section>
      </section>
    </If>

    <section className='mt-3'>
      <Button type='primary' disabled={isValid === false} onClick={() => post(formValue)}>
        Submit
      </Button>
    </section>
  </section>
);
