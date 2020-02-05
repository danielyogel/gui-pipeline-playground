import { TypeOf } from 'io-ts';
import { autorun, IComputedValue, computed as mobxComputed } from 'mobx';
import { constant } from 'fp-ts/es6/function';
import { deepEqual } from 'utils/fp';

import { GetVmType } from 'utils/utils';
import { InitLogger } from 'utils/Logger';
import { Init } from 'utils/Init';
import { VmType as ProductsVmType } from 'pages/application/products/ProductsVM';
import CreateTemplateVM from 'components/template-editor/template-editor-vm';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { TemplateServiceType } from 'store/abstract/TemplateService';
import { MediaAsset, Category, EntityStatus, Product, Visibility } from 'clientApi';
import { TemplateV } from 'schemas/template.interfaces';

type View =
  | { PAGE: null }
  | { PAGE: 'TEMPLATE_LIST' }
  | { PAGE: 'TEMPLATE_EDIT'; id: string }
  | { PAGE: 'PRODUCT_LIST' }
  | { PAGE: 'PRODUCT_EDIT'; id: string };

type Params = {
  category: Category;
  onChange: (change: Partial<Category>) => void;

  setView: (v: View) => void;
  currView: IComputedValue<View>;
  catProdVms: ProductsVmType;

  templateServ: TemplateServiceType;
  apiServ: ApiServiceType;

  modalServ: ModalServiceType;
  stickers: IComputedValue<MediaAsset[]>;
  backgrounds: IComputedValue<MediaAsset[]>;
};

export default function CreateVM({ category, catProdVms, onChange, setView, currView, stickers, backgrounds, apiServ, templateServ, modalServ }: Params) {
  const { productsVM, productListVM, productPutVM } = catProdVms;

  const STATE = constant({
    categoryForm: { ...category },
    imageBlob: null as null | Blob,
    templates: [] as Array<ReturnType<typeof CreateTemplateVM>>,
    isListLoading: false,
    isGetProductsLoading: false,

    categoryProducts: [] as Array<Product>,
    productsVM,
    productListVM,
    productPutVM
  });

  return Init({ deep: false })
    .meta({})
    .model(STATE)
    .views(({ state }) => {
      const { publishedTemplates, draftTemplates, archivedTemplates } = state.templates.reduce(
        (acc, currtemplate) => {
          return {
            publishedTemplates: [...acc.publishedTemplates, ...(currtemplate.state.status === EntityStatus.PUBLISH ? [currtemplate] : [])],
            draftTemplates: [...acc.draftTemplates, ...(currtemplate.state.status === EntityStatus.DRAFT ? [currtemplate] : [])],
            archivedTemplates: [...acc.archivedTemplates, ...(currtemplate.state.status === EntityStatus.ARCHIVE ? [currtemplate] : [])]
          };
        },
        {
          publishedTemplates: [] as typeof state.templates,
          draftTemplates: [] as typeof state.templates,
          archivedTemplates: [] as typeof state.templates
        }
      );

      const VIEW = currView.get();

      return {
        category: category,
        isSelected: currView.get().PAGE !== null,
        isVisible: currView.get().PAGE !== null,
        catagoryId: category.id,
        selectedView: currView.get(),
        selectedTemplate: VIEW.PAGE === 'TEMPLATE_EDIT' ? state.templates.find(s => s.state.content.gui_id === VIEW.id) : null,
        publishedTemplates,
        draftTemplates,
        archivedTemplates
      };
    })
    .actions(({ state, computed, setState, mergeState }) => {
      let lastSyncedDetails = { ...state.categoryForm } as null | Partial<Category>;

      return {
        setView,
        _addTemplate,
        onFormChange(change: Partial<Category>) {
          setState({ categoryForm: { ...state.categoryForm, ...change } });
        },
        onCategoryImage(imageBlob: Blob | null) {
          setState({ imageBlob });
        },
        async submitChanges() {
          const val = state.categoryForm;
          if (!state.imageBlob && deepEqual(val, lastSyncedDetails)) {
            return;
          }

          apiServ
            .catagoriesApi()
            .updateCategory(val.id, val.name, val.description, state.imageBlob || undefined, val.status)
            .then(({ data }) => {
              setState({ categoryForm: { ...state.categoryForm, ...data } });
              onChange(data);
              lastSyncedDetails = data;
            })
            .catch(() => {
              modalServ.error({ title: 'Failure while trying to update category' });
            })
            .finally(() => {
              setState({ imageBlob: null });
            });
        },
        async getCategoryTemplates() {
          setState({ isListLoading: false });
          await templateServ
            .getTemplatesPaged(category.id, 1, 10, Visibility.PLATFORM)
            .then(data => {
              setState({ templates: data.map(_TemplateVM) });
            })
            .catch(err => {
              const message = `Failed to fetch category ${computed.get().category.id} templates`;
              modalServ.error({ title: message });
              logger.error(message, err);
            })
            .finally(() => {
              setState({ isListLoading: false });
            });
        },
        async getCategoryProducts() {
          state.isGetProductsLoading = true;
          const res = await apiServ
            .productsApi()
            .getProductsPaged(1, 10, Visibility.PLATFORM, category.id)
            .catch(() => {
              modalServ.error({ title: `Failed to fetch category ${computed.get().category.id} products` });
            })
            .finally(() => (state.isGetProductsLoading = false));

          if (res) {
            setState({ categoryProducts: res.data.filter(p => p.status === EntityStatus.PUBLISH) });
          }
        }
      };

      function _TemplateVM(template: TypeOf<typeof TemplateV>) {
        return CreateTemplateVM({
          template,
          templateService: templateServ,
          modalService: modalServ,
          stickers,
          backgrounds,
          products: mobxComputed(() => state.categoryProducts),
          onFinish: () => setView({ PAGE: 'TEMPLATE_LIST' }),
          addTemplate: _addTemplate
        });
      }

      function _addTemplate() {
        templateServ
          .createTemplateIntoCategory(computed.get().catagoryId)
          .then(res => {
            setState({ templates: [_TemplateVM(res), ...state.templates] });
            setView({ PAGE: 'TEMPLATE_EDIT', id: res.content.gui_id });
          })
          .catch(() => {
            modalServ.error({ title: 'Failed to create template!' });
          });
      }
    })
    .init(({ state, methods }) => {
      currView.observe(({ newValue, oldValue }) => {
        if (!oldValue || (newValue.PAGE === 'PRODUCT_LIST' && newValue.PAGE !== oldValue.PAGE)) {
          methods.getCategoryTemplates();
          methods.getCategoryProducts();
        }
      }, true);

      autorun(
        () => {
          if (state.categoryForm || state.imageBlob) methods.submitChanges();
        },
        { delay: 1000 }
      );
    });
}

// Internals
const logger = InitLogger({ dirname: 'category_edit', filename: 'categoryEditVM.ts' });
export type VmType = ReturnType<typeof CreateVM>;
export type VmViewType = GetVmType<typeof CreateVM>;
