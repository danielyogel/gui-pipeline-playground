import React from 'react';
import { observer } from 'mobx-react';
import { If } from 'react-extras';
import { Menu, Dropdown, Icon, Input } from 'antd';

import { SectionLoader } from 'components/Loader';
import TemplateEditor from 'components/template-editor/template-editor';
import { VmViewType as CategoryVmType } from './categoeryEditVM';
import ProductList from 'pages/application/products/ProductList/ProductList';
import ProductUpdateForm from 'pages/application/products/ProductForm/ProductForm';
import { EntityStatus } from 'clientApi';
import { HiddenFileInput } from 'components/files-inputs/HiddenFileInput';
import { TemplateList } from './CategoryTemplateList';
import { RenderForm } from './CategoryForm';

const ProductUpdateFormObserver = observer(ProductUpdateForm);
const ProductListObserver = observer(ProductList);

const placeholderText = 'Enter name...';

export default observer(function({
  state: { isListLoading, categoryForm, productListVM, productPutVM, productsVM },
  computed: { selectedTemplate, publishedTemplates, draftTemplates, archivedTemplates, isVisible, selectedView },
  methods: { onFormChange, onCategoryImage, setView, _addTemplate: addTemplate }
}: CategoryVmType) {
  const nameInputRef = React.useRef<Input>(null);

  if (!isVisible) {
    return null;
  }

  if (isListLoading) {
    return <SectionLoader />;
  }

  if (selectedTemplate) {
    return <TemplateEditor {...selectedTemplate} computed={selectedTemplate.computed.get()} viewMode={false} />;
  }

  const HEADER = (
    <>
      <div className='flex justify-start items-center'>
        <div className='mr-4 flex items-center'>
          <Input
            value={categoryForm.name}
            onChange={e => onFormChange({ name: e.target.value })}
            placeholder={placeholderText}
            style={{ width: (categoryForm.name.length || placeholderText.length) * 11.6 + 'px', minWidth: '85px' }}
            className='outline-none border-none truncate max-w-xs text-lg font-bold text-bb-dark-purple bg-transparent mr-1 pr-1 placeholder-gray-500'
            ref={nameInputRef}></Input>
          <Icon
            type='edit'
            theme='filled'
            className='align-middle ml-1 text-base cursor-pointer'
            onClick={() => nameInputRef.current && nameInputRef.current.focus()}
          />
        </div>
        <div className='cursor-pointer' onClick={addTemplate}>
          <span>Create New Template</span>
          <Icon type='plus' className='align-middle ml-1' />
        </div>
        {selectedView.PAGE === 'PRODUCT_EDIT' || selectedView.PAGE === 'PRODUCT_LIST' ? (
          <div className='m-3 mr-10 cursor-pointer' onClick={() => setView({ PAGE: 'TEMPLATE_LIST' })}>
            <span>Back to Category</span>
            <Icon type='rollback' className='align-baseline ml-1' />
          </div>
        ) : (
          <div className='cursor-pointer ml-3' onClick={() => setView({ PAGE: 'PRODUCT_LIST' })}>
            <span>Products</span>
            <Icon type='shopping-cart' className='align-middle ml-1' />
          </div>
        )}
      </div>
      <div className='mr-4'>
        <Dropdown
          overlay={
            <Menu>
              {Object.values(EntityStatus).map(currStatus => (
                <Menu.Item key={currStatus} className='capitalize' onClick={onFormChange.bind(null, { status: currStatus })}>
                  {currStatus.toLowerCase()}
                </Menu.Item>
              ))}
            </Menu>
          }>
          <section className='capitalize cursor-pointer'>
            <span>{categoryForm.status.toLowerCase()}</span> <Icon type='down' className='align-middle' />
          </section>
        </Dropdown>
      </div>
    </>
  );

  const FORM = (
    <section className='flex justify-start items-start'>
      <HiddenFileInput onFile={onCategoryImage}>
        <div className='mb-6 h-32 w-32 flex justify-center items-start relative cursor-pointer group'>
          {categoryForm.picture ? (
            <section className='mr-6'>
              <img className='w-full h-full object-contain object-left-top' src={categoryForm.picture.urlMinimized} alt='category'></img>
              <div
                style={{ top: '2px', right: '10px' }}
                className='absolute bg-bb-dark-purple cursor-pointer text-white text-xs mr-2 border rounded-sm pl-1 pr-1 w-12 border-bb-dark-purple flex items-center justify-between opacity-0 group-hover:opacity-100 bb-transition-all'>
                <Icon type='picture' theme='filled' title='Change Category Image' />
                <span>Edit</span>
              </div>
            </section>
          ) : (
            <div className='mt-8'>
              <span>Add Image</span> <Icon type='plus' className='text-lg align-baseline' />
            </div>
          )}
        </div>
      </HiddenFileInput>
      <div className='w-64'>
        <section>
          <RenderForm categoryForm={categoryForm} onFormChange={onFormChange}></RenderForm>
        </section>
      </div>
    </section>
  );

  const LISTS = (
    <section>
      <TemplateList items={publishedTemplates} selectTemplate={id => setView({ PAGE: 'TEMPLATE_EDIT', id })} title='Collections'></TemplateList>
      <TemplateList items={draftTemplates} selectTemplate={id => setView({ PAGE: 'TEMPLATE_EDIT', id })} title='Drafts'></TemplateList>
      <TemplateList items={archivedTemplates} selectTemplate={id => setView({ PAGE: 'TEMPLATE_EDIT', id })} title='Archived'></TemplateList>
    </section>
  );

  return (
    <section className='h-full'>
      <section className='h-12 p-6 flex justify-between items-center bg-gray-200'>{HEADER}</section>
      <section className='p-6 overflow-y-scroll bb-slide-up' style={{ height: 'calc(100% - 3rem)' }}>
        <If condition={selectedView.PAGE === 'PRODUCT_LIST'}>
          <section className='flex items-center justify-start text-lg font-bold ml-6'>
            <div>Products</div>
            <div className='cursor-pointer ml-3 text-base font-normal' onClick={productsVM.methods.startCreate}>
              <span>Add New Product</span>
              <Icon type='plus' className='align-middle ml-1' />
            </div>
          </section>
          <ProductListObserver {...productListVM} computed={productListVM.computed.get()}></ProductListObserver>
        </If>

        <If condition={selectedView.PAGE === 'PRODUCT_EDIT'}>
          <ProductUpdateFormObserver {...productPutVM} computed={productPutVM.computed.get()}></ProductUpdateFormObserver>
        </If>

        <If condition={selectedView.PAGE === 'TEMPLATE_LIST'}>
          {FORM}
          {LISTS}
        </If>
      </section>
    </section>
  );
});
