import React from 'react';
import { Icon } from 'antd';
import { IComputedValue } from 'mobx';
import { deepEqual, Ord, pipe, Array as FpTsArray, NonEmptyArray } from 'utils/fp';
import ItemsList from 'components/ItemsList/ItemsList';
import { State, Computed, Methods, Run, View } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import CategoryModel from 'store/abstract/CategoryModel';
import { Category, EntityStatus } from 'clientApi';
import { VmType as CategoeyVmType } from '../CategoryEdit/categoeryEditVM';
import { DELETE_STATUS, precedence } from './internals';

interface Params {
  refresh: IComputedValue<Boolean>;
  isVisible: IComputedValue<Boolean>;
  InitCategoryVM: (initialCategory: Category) => CategoeyVmType;
  onSelectCategory: (id: string) => void;
  createCategoey: () => void;
  categoryModel: ReturnType<typeof CategoryModel>;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
}

export default function({
  categoryModel,
  apiService,
  modalService,
  onSelectCategory,
  createCategoey,
  refresh,
  isVisible,
  InitCategoryVM
}: Params) {
  return pipe(
    State(
      {
        catagoryVMs: [] as CategoeyVmType[]
      },
      { deep: false }
    ),
    Computed(({ state }) => ({
      isVisible: isVisible.get(),
      selectedCategory: state.get().catagoryVMs.find(c => c.computed.get().isSelected),
      categoryByStatus: pipe(
        state.get().catagoryVMs,
        FpTsArray.filter(c => c.state.categoryForm.status !== DELETE_STATUS),
        NonEmptyArray.groupBy(c => c.state.categoryForm.status),
        g => Object.entries(g) as Array<[EntityStatus, Array<CategoeyVmType>]>,
        pairs => pairs.sort((a, b) => Ord.ordNumber.compare(precedence[b[0]], precedence[a[0]]))
      )
    })),
    Methods(({ state, clear }) => ({
      getAll: categoryModel.methods.getAll,
      onSelectCategory,
      createCategoey,
      deleteCategory(id: number) {
        const categoryVM = state.get().catagoryVMs.find(c => c.computed.get().catagoryId === id);
        if (categoryVM) {
          const c = categoryVM.computed.get().category;
          apiService
            .catagoriesApi()
            .updateCategory(c.id, c.name, c.description, undefined, DELETE_STATUS)
            .then(() => {
              modalService.success({ title: 'Category Removed' });
              categoryModel.methods.onCategoryChange(c.id, { status: DELETE_STATUS });
            })
            .catch(e => {
              console.error(e);
              modalService.error({ title: 'Failure' });
            });
        }
      },
      clear
    })),
    Run(({ state, setState }) => {
      refresh.observe(({ newValue, oldValue }) => {
        if (newValue && oldValue !== newValue) {
          categoryModel.methods.getAll();
        }
      }, true);

      categoryModel.computed.observe(({ newValue, oldValue }) => {
        if (!deepEqual(newValue.unDeletedCategories, oldValue?.unDeletedCategories)) {
          const existingVmIds = state.get().catagoryVMs.map(currVm => currVm.computed.get().catagoryId);
          const modelIds = newValue.unDeletedCategories.map(c => c.id);

          const newVms = newValue.unDeletedCategories
            .filter(currCategory => existingVmIds.includes(currCategory.id) === false)
            .map(InitCategoryVM);

          const filteredOldVms = state.get().catagoryVMs.filter(currVM => modelIds.includes(currVM.computed.get().catagoryId));

          setState({ catagoryVMs: [...newVms, ...filteredOldVms] });
        }
      }, true);
    }),
    View(({ computed, methods: { deleteCategory } }) => {
      const { categoryByStatus } = computed.get();

      const HEADER = (
        <>
          <div className='mr-4 texl-lg font-bold'>Categories</div>
          <div className='cursor-pointer' onClick={createCategoey}>
            <span>Create New Category</span>
            <Icon type='plus' className='align-middle ml-1' />
          </div>
        </>
      );

      const LIST = categoryByStatus.map(([name, items]) => {
        const nameLower = name.toLowerCase();
        return (
          <section key={name}>
            <section className='text-lg font-bold capitalize'>{nameLower === 'publish' ? 'published' : nameLower}</section>
            <ItemsList
              title='Categories'
              onDelete={deleteCategory}
              items={items.map(currVM => {
                const { id, name, picture } = currVM.computed.get().category;
                return { id, name, url: picture ? picture.url : null };
              })}
              onSelect={c => onSelectCategory(c.toString())}></ItemsList>
          </section>
        );
      });

      return (
        <section className='h-full'>
          <section className='h-12 p-6 flex justify-start items-center bg-gray-200'>{HEADER}</section>
          <section className='p-6 bb-slide-up overflow-y-scroll' style={{ height: 'calc(100% - 3rem)' }}>
            {LIST}
          </section>
        </section>
      );
    })
  );
}
