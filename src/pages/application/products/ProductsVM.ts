import { IComputedValue, computed } from 'mobx';

import { Init } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { CreateProductPutVM } from './ProductForm/ProductFormVM';
import { ProductListVM } from './ProductList/ProductsListVM';
import { Category } from 'clientApi';

type Params = {
  allCategories: IComputedValue<Category[]>;
  onSelectId: (id: number | null) => void;
  selectedView: IComputedValue<number | 'LIST' | null>;
  inCategoeyMode: false | number;
  mode: IComputedValue<'USER' | 'PLATFORM' | null>;
  refresh: IComputedValue<boolean>;

  apiService: ApiServiceType;
  modalService: ModalServiceType;
};

export function CreateProductsVM({ apiService, modalService, allCategories, selectedView, onSelectId, inCategoeyMode, mode, refresh }: Params) {
  const productsVM = Init()
    .meta({})
    .model(() => ({ createError: null as null | Error, createLoading: false }))
    .views(() => ({ currentView: selectedView.get(), isVisible: selectedView.get() !== null }))
    .actions(({ state }) => ({
      async startCreate() {
        try {
          state.createLoading = true;
          state.createError = null;
          const { data } = await apiService.productsApi().createProduct({ name: '' });
          if (inCategoeyMode) {
            await apiService.productsApi().updateProductCategories(data.id, [{ id: inCategoeyMode }]);
          }
          onSelectId(data.id);
        } catch (error) {
          state.createError = error;
          modalService.error({ title: 'Failed to initiate a new product' });
        } finally {
          state.createLoading = false;
        }
      },
      startEdit(id: number) {
        onSelectId(id);
      },
      backToList() {
        onSelectId(null);
      }
    }));

  const productListVM = ProductListVM({
    apiService,
    modalService,
    allCategories,
    onEditRequest: productsVM.methods.startEdit,
    inCategoeyMode,
    mode: computed(() => (selectedView.get() === 'LIST' ? mode.get() : null)),
    refresh: computed(() => !!(selectedView.get() === 'LIST' ? mode.get() : null))
  });

  const productPutVM = CreateProductPutVM({
    allCategories,
    onFormEnd: productsVM.methods.backToList,
    idToEdit: computed(() => {
      const view = selectedView.get();
      return view === 'LIST' ? null : view;
    }),
    inCategoeyMode,
    apiService,
    modalService
  });

  return { productsVM, productListVM, productPutVM };
}

export type VmType = ReturnType<typeof CreateProductsVM>;
