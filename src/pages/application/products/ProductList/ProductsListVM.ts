import { IComputedValue } from 'mobx';
import { Merge } from 'type-fest';
import { GetVmType, notUndefined } from 'utils/utils';
import { pipe, flow, Array, Either } from 'utils/fp';
import { Init } from 'utils/Init';
import { Product, EntityStatus, Category, Visibility } from 'clientApi';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { ProductDetailsSchema, ProductDetailsType } from 'schemas/product-details-schema';
import { contramap, ordNumber } from 'fp-ts/es6/Ord';
import { InitLogger } from 'utils/Logger';
const log = InitLogger({ dirname: 'products/productsList', filename: 'ProductsListVM.tsx' });
const { map, sort } = Array;

type Params = {
  inCategoeyMode: false | number;
  mode: IComputedValue<'USER' | 'PLATFORM' | null>;
  refresh: IComputedValue<boolean>;

  onEditRequest: (id: number) => void;
  allCategories: IComputedValue<Category[]>;

  apiService: ApiServiceType;
  modalService: ModalServiceType;
};

export function ProductListVM({ apiService, modalService, allCategories, onEditRequest, inCategoeyMode, mode, refresh }: Params) {
  return Init()
    .meta({})
    .model(() => ({
      userItems: [] as ProductWithDetails[],
      productsByCategory: [] as CategoryNameAndProducts[],
      selectedCategoryTab: null as null | string
    }))
    .views(({ state }) => ({
      backofficeItems: mapSortCategories(state.productsByCategory),
      inBackOffice: mode.get() === 'PLATFORM',
      inCategoeyMode
    }))
    .actions(({ state, setState, computed }) => ({
      onEditRequest,
      onDelete(id: number) {
        apiService
          .productsApi()
          .deleteProduct(id)
          .then(() => {
            setState({
              productsByCategory: state.productsByCategory.map(currEntity => ({
                ...currEntity,
                products: currEntity.products.filter(p => p.id !== id)
              }))
            });

            modalService.success({ title: 'Removed Successfully!' });
          })
          .catch(e => {
            log.error('Products onDelete failure', e);
            modalService.error({ title: 'Failure!' });
          });
      },
      importFromBackoffice(id: number) {
        if (computed.get().inBackOffice === false) {
          apiService
            .productsApi()
            .importPlatformProduct(id)
            .then(({ data }) => {
              pipe(
                ProductDetailsSchema.decode(data.details),
                Either.fold(
                  error => log.validationError('product details validation', error),
                  details => setState({ userItems: [{ ...data, details }, ...state.userItems] })
                )
              );
            })
            .catch(e => {
              log.error('import prodcut failure', e);
              modalService.error({ title: 'Something Went Wrong' });
            });
        }
      },
      selectCategoryTab(name: string) {
        setState({ selectedCategoryTab: name });
      },
      getAll() {
        Promise.all(
          allCategories
            .get()
            .filter(c => (inCategoeyMode ? c.id === inCategoeyMode : true))
            .map(currCategory =>
              apiService
                .productsApi()
                .getProductsPaged(1, 100, Visibility.PLATFORM, currCategory.id)
                .then(res => {
                  const products = res.data.map(p => {
                    const details = p.details;
                    return pipe(
                      ProductDetailsSchema.decode(details),
                      Either.fold(
                        e => {
                          log.validationError('Product Details', e);
                          return undefined;
                        },
                        details => ({ ...p, details })
                      )
                    );
                  });
                  return { categoryName: currCategory.name, products: products.filter(notUndefined) };
                })
            )
        )
          .then(productsByCategory =>
            setState({ productsByCategory, selectedCategoryTab: productsByCategory[0].categoryName || null })
          )
          .catch(e => {
            log.error('Products getAll failure', e);
            modalService.error({ title: 'Something Went Wrong' });
          });

        if (computed.get().inBackOffice === false) {
          apiService
            .productsApi()
            .getProductsPaged(1, 100, Visibility.USER)
            .then(res => {
              const products = res.data.map(p => {
                const details = p.details;
                return pipe(
                  ProductDetailsSchema.decode(details),
                  Either.fold(
                    e => log.validationError('Product Details', e),
                    details => ({ ...p, details })
                  )
                );
              });

              setState({ userItems: products.filter(notUndefined) });
            });
        }
      }
    }))
    .init(({ methods }) => {
      const disposer = allCategories.observe(({ newValue }) => {
        if (newValue.length) {
          disposer();
          refresh.observe(({ newValue, oldValue }) => {
            if (newValue && newValue !== oldValue) {
              methods.getAll();
            }
          }, true);
        }
      }, true);
    });
}

export type VmType = GetVmType<typeof ProductListVM>;

type ProductWithDetails = Merge<
  Product,
  {
    details: ProductDetailsType;
  }
>;

//
// INTERNALS
//
type CategoryNameAndProducts = {
  categoryName: Category['name'];
  products: ProductWithDetails[];
};

const OrdCategoryNameAndProducts = contramap<number, CategoryNameAndProducts>(i => i.products.length)(ordNumber);

const mapSortCategories = flow(
  sort(OrdCategoryNameAndProducts),
  map(i => ({ ...i, products: i.products.filter(p => p.status === EntityStatus.PUBLISH) }))
);
