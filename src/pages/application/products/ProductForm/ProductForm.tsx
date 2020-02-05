import React from 'react';
import { classNames } from 'react-extras';
import { Icon, Select } from 'antd';
import {} from 'fp-ts';
import { observer } from 'mobx-react';

import { HiddenFileInput } from 'components/files-inputs/HiddenFileInput';
import { VmType } from 'pages/application/products/ProductForm/ProductFormVM';
import { StringRow, NumberRow } from 'components/Inputs/CustomInputs';
import { StringInputWithUnits, NumberInputWithUnits } from 'components/Inputs/CutomInputsWithUnit';

import { SmallImageContainer } from './ProductForm__utils';

const LeftColumnPage = observer(LeftColumn);
const RightColumnPage = observer(RightColumn);

export default function(params: VmType) {
  return (
    <section className='flex items-stretch bb-slide-up' style={{ width: '1050px' }}>
      <LeftColumnPage {...params} />
      <RightColumnPage {...params} />
    </section>
  );
}

//
// Left Column and Components
//

function LeftColumn({
  state: { formValue, uploadedImages, previewImageBgColor },
  computed: { mediaAssetForPreview, isPreviewDefault },
  methods: { onChange, uploadImage, removeImage, onImagePreviewSelect, onPreviewBgcolor, removeImageBackground }
}: VmType) {
  if (!formValue) return null;

  return (
    <section className='p-4 w-3/4'>
      <section className='flex justify-between mb-4 '>
        <div
          className='bg-bb-dark-purple text-white flex items-center justify-center pt-1 pb-1 pl-2 pr-2 shadow-lg rounded-sm cursor-pointer'
          onClick={() => mediaAssetForPreview && removeImageBackground(mediaAssetForPreview.id)}>
          <Icon type='thunderbolt' className='mr-1' />
          <span>Remove Background</span>
        </div>
        <div className='flex items-center'>
          <div
            className={classNames('align-middle mr-4 cursor-pointer', { 'text-green-500': isPreviewDefault })}
            onClick={() => mediaAssetForPreview && onChange({ defaultMedia: mediaAssetForPreview })}>
            <span className={classNames('mr-2')}>{isPreviewDefault ? 'Default' : 'Set as default'}</span>
            <Icon type='check-circle' theme='filled' className='relative' style={{ top: '-2px' }} />
          </div>
          <div
            className='p-4 shadow-md rounded-lg cursor-pointer mr-2 bg-black'
            onMouseDown={onPreviewBgcolor.bind(null, 'black')}
            onMouseUp={onPreviewBgcolor.bind(null, null)}
          />
          <div
            className='p-4 shadow-md border border-gray-300 border-2 rounded-lg cursor-pointer'
            onMouseDown={onPreviewBgcolor.bind(null, 'white')}
            onMouseUp={onPreviewBgcolor.bind(null, null)}
          />
        </div>
      </section>

      <section
        style={{ height: '30rem' }}
        className={classNames('p-8 flex items-center justify-center', {
          'bb-background-stripes': previewImageBgColor === null,
          'bg-white': previewImageBgColor === 'white',
          'bg-black': previewImageBgColor === 'black'
        })}>
        {mediaAssetForPreview ? <img src={mediaAssetForPreview.url} alt={mediaAssetForPreview.name} className='h-full' /> : 'No Image Selected'}
      </section>

      <section className='flex'>
        {Object.values(uploadedImages).map(image => {
          return (
            <SmallImageContainer key={image.id} isSelected={Number(image.id) === Number(formValue.defaultMedia.id)}>
              <div className='h-full flex items-center justify-center p-2 cursor-pointer' onClick={onImagePreviewSelect.bind(null, image.id)}>
                <img src={image.url} alt={image.id.toString()} className='block h-full w-full object-contain' />

                <Icon
                  type='close-circle'
                  theme='filled'
                  className='text-red absolute'
                  style={{ top: '-10%', right: '5%' }}
                  onClick={e => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                />
              </div>
            </SmallImageContainer>
          );
        })}
        <SmallImageContainer>
          <HiddenFileInput onFile={uploadImage} className='cursor-pointer flex items-center justify-center bg-gray-200 h-full w-full'>
            <Icon type='plus' className='text-3xl' />
          </HiddenFileInput>
        </SmallImageContainer>
      </section>
    </section>
  );
}

//
// Right Column and Components
//
function RightColumn({ state: { formValue, selectedCatagories }, computed: { allCategories }, methods: { onChange, onCatagorySelect } }: VmType) {
  if (!formValue) return null;

  const details = formValue.details;

  const onDetailsChagnge = (change: Partial<typeof details>) => onChange({ ...formValue, details: { ...formValue.details, ...change } });

  return (
    <section>
      <section className='mb-3'>
        <section>
          <StringRow placeholder='Name' value={formValue.name} onChange={name => onChange({ ...formValue, name })} />
        </section>
        <section>
          <NumberRow placeholder='Price' value={formValue.price} onChange={price => onChange({ ...formValue, price })} />
        </section>
      </section>

      <section>
        <section>
          <Icon type='font-size' className='mr-2 text-xl' />
          <b>Product Labels</b>
        </section>
        <StringInputWithUnits title='brand' state={details.brand} onStateChange={val => onDetailsChagnge({ brand: val })} units={[null]} />
        <StringInputWithUnits title='model' state={details.model} onStateChange={val => onDetailsChagnge({ model: val })} units={[null]} />
        <NumberInputWithUnits title='weight' state={details.weight} onStateChange={val => onDetailsChagnge({ weight: val })} units={['gr', 'kg']} />
        <NumberInputWithUnits title='items' state={details.items} onStateChange={val => onDetailsChagnge({ items: val })} units={[null]} />
        <NumberInputWithUnits title='dimension' state={details.dimension} onStateChange={val => onDetailsChagnge({ dimension: val })} units={[null]} />
        <StringInputWithUnits title='size' state={details.size} onStateChange={val => onDetailsChagnge({ size: val })} units={[null]} />
        <StringInputWithUnits title='colors' state={details.colors} onStateChange={val => onDetailsChagnge({ colors: val })} units={[null]} />
        <StringInputWithUnits title='ingredients' state={details.ingredients} onStateChange={val => onDetailsChagnge({ ingredients: val })} units={[null]} />
      </section>

      <section>
        <section>Catagories</section>
        {allCategories.length ? (
          <Select
            mode='multiple'
            style={{ width: '100%' }}
            placeholder='Please select'
            value={selectedCatagories}
            onChange={(v: number[]) => onCatagorySelect(v)}>
            {allCategories.map(currCategory => (
              <Select.Option key={currCategory.id} value={currCategory.id}>
                {currCategory.name}
              </Select.Option>
            ))}
          </Select>
        ) : null}
      </section>
    </section>
  );
}
