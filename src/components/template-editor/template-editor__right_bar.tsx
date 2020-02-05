import React, { RefObject, useState } from 'react';
import { Icon } from 'antd';
import { If, classNames } from 'react-extras';
import { SwatchesPicker } from 'react-color';

import { NodeKind, SvgKinds } from 'schemas';
import { NodeViewer } from './utils/template-editor-utils';
import { VmType } from './template-editor-vm';
import logoUrl from 'Icon-GRT.png';

import {} from 'utils/utils';
import { useSliderWithButton } from 'components/Slider/Slider';
export default function RightBarComponent({
  state: { content: templateContent },
  computed: { stickersForDisplay, backgroundsForDisplay, productsForDisplay },
  methods: { onAdd, addBackground, onAddImage, onAddLogo }
}: VmType) {
  const [productTab, setBackgroundTab] = useState('IMAGE' as 'IMAGE' | 'SOLID');

  const ProductSlider = useSliderWithButton({
    ButtonElement: <ComponentButton title='Product' iconType='shopping-cart' />,
    SliderElement: (
      <SliderContentContainer singleItemMode={productsForDisplay.length < 2}>
        {productsForDisplay.length ? (
          productsForDisplay.map(currProduct => (
            <SliderInnerBox key={currProduct.id} onClick={() => onAddImage(currProduct.defaultMedia, 'PRODUCT_IMAGE')}>
              <b className='text-center h-8'>{currProduct.name}</b>
              <img src={currProduct.defaultMedia.url} alt={currProduct.name} className='object-contain block' style={{ height: 'calc(100% - 2rem)' }} />
            </SliderInnerBox>
          ))
        ) : (
          <SliderInnerBox>No Items</SliderInnerBox>
        )}
      </SliderContentContainer>
    )
  });

  const ImageSlider = useSliderWithButton({
    ButtonElement: <ComponentButton title='Stickers' iconType='shop' />,
    SliderElement: (
      <SliderContentContainer singleItemMode={stickersForDisplay.length < 2}>
        {stickersForDisplay.length ? (
          stickersForDisplay.map(sticker => (
            <SliderInnerBox key={sticker.id} onClick={() => onAddImage(sticker, 'STICKER')}>
              <img src={sticker.url} alt={sticker.name} className='block h-full w-full object-contain' />
            </SliderInnerBox>
          ))
        ) : (
          <SliderInnerBox>No Items</SliderInnerBox>
        )}
      </SliderContentContainer>
    )
  });

  const backgroundSlider = useSliderWithButton({
    ButtonElement: <ComponentButton title='Background' iconType='picture' />,
    SliderElement: (
      <SliderContentContainer singleItemMode={false}>
        <section className='shadow w-full'>
          <section className='flex justify-between w-full items-center pt-4'>
            {(['IMAGE', 'SOLID'] as const).map(tabName => {
              return (
                <div
                  key={tabName}
                  className={classNames('w-1/2 cursor-pointer h-8 text-center', { 'font-bold': tabName === productTab })}
                  onClick={setBackgroundTab.bind(null, tabName)}>
                  <span className='capitalize'>{tabName === 'IMAGE' ? 'Image' : 'Solid Color'}</span>
                </div>
              );
            })}
          </section>
          <>
            <If condition={productTab === 'IMAGE'}>
              {backgroundsForDisplay.length ? (
                <section className='w-full flex items-start justify-between flex-wrap content-start'>
                  {backgroundsForDisplay.map(bgImage => (
                    <SliderInnerBox key={bgImage.id} onClick={() => addBackground(bgImage)}>
                      <img src={bgImage.url} alt={bgImage.name} className='block h-full w-full object-contain' />
                    </SliderInnerBox>
                  ))}
                </section>
              ) : (
                <SliderInnerBox>No Items</SliderInnerBox>
              )}
            </If>
            <If condition={productTab === 'SOLID'}>
              <section className='flex justify-center w-full'>
                <SwatchesPicker color={templateContent.bg_color} onChangeComplete={color => addBackground(color.hex)} width={230} />
              </section>
            </If>
          </>
        </section>
      </SliderContentContainer>
    )
  });
  const ShapesSlider = useSliderWithButton({
    ButtonElement: <ComponentButton title='Shapes' iconType='pie-chart' />,

    SliderElement: (
      <SliderContentContainer singleItemMode={SvgKinds.length < 2}>
        {SvgKinds.map(svgKind => (
          <SliderInnerBox
            key={svgKind}
            onClick={() => {
              onAdd(svgKind);
            }}>
            <section className='flex justify-center mb-3'>
              <NodeViewer nodeKind={svgKind} style={{ width: '50%' }} />
            </section>
            <span>{svgKind}</span>
          </SliderInnerBox>
        ))}
      </SliderContentContainer>
    )
  });

  return (
    <section className='h-full relative z-10'>
      <section className='w-full h-full bg-gray-200 pt-4 pb-12 relative z-10 overflow-y-scroll'>
        <ComponentButton title='Logo' iconType='buildboard' onClick={onAddLogo} />
        {ProductSlider.Button}
        {ImageSlider.Button}
        {backgroundSlider.Button}
        {ShapesSlider.Button}
        <ComponentButton title='Text' iconType='font-size' onClick={() => onAdd(NodeKind.TEXT)} />
      </section>

      {ImageSlider.Slider}
      {ProductSlider.Slider}
      {ShapesSlider.Slider}
      {backgroundSlider.Slider}
    </section>
  );
}

//
// INTERNALS
//
const SliderContentContainer = ({ children, singleItemMode }: { children: React.ReactNode; singleItemMode: boolean }) => (
  <section
    className='px-2 pt-2 pb-0 z-50 flex items-start justify-between flex-wrap content-start overflow-y-scroll cursor-pointer text-center bg-gray-200'
    style={{ width: singleItemMode ? '10rem' : '19rem', maxHeight: '600px' }}>
    {children}
  </section>
);

const SliderInnerBox = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <section
    className='bg-white flex flex-col items-stretch justify-center p-2 w-32 h-32 mb-2 cursor-pointer text-center flex-shrink-0'
    onClick={() => onClick && onClick()}>
    {children}
  </section>
);

type ComponentButtonParamss = {
  title: string;
  iconType: string;
  onClick?: () => void;
  forwardRef?: RefObject<HTMLDivElement>;
};

const ComponentButton = ({ title, iconType, onClick, forwardRef }: ComponentButtonParamss) => (
  <div className='w-40 h-24 mb-4 bg-white flex flex-col items-center justify-center cursor-pointer mx-auto' onClick={onClick} ref={forwardRef}>
    {iconType === 'buildboard' ? <img src={logoUrl} alt='logo' className='h-12'></img> : <Icon type={iconType} style={{ fontSize: '22px' }} className='mb-2' />}

    <span>{title}</span>
  </div>
);
