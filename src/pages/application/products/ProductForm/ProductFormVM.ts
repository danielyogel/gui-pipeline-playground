import { IComputedValue, autorun } from 'mobx';
import { O } from 'ts-toolbelt';
import { isRight } from 'fp-ts/es6/Either';

import { GetVmType } from 'utils/utils';
import { Init } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { MediaAsset, Product, EntityStatus, Category } from 'clientApi';

import { ProductDetailsSchema, ProductDetailsType, defaultValue } from 'schemas/product-details-schema';

type Params = {
  idToEdit: IComputedValue<number | null>;
  onFormEnd: () => void;
  allCategories: IComputedValue<Category[]>;
  inCategoeyMode: false | number;

  apiService: ApiServiceType;
  modalService: ModalServiceType;
};

export function CreateProductPutVM({ idToEdit, onFormEnd, allCategories, apiService, modalService, inCategoeyMode }: Params) {
  type FormProductDetailsExtra = {
    defaultMedia: O.Optional<Product['defaultMedia'], 'id'>;
    details: ProductDetailsType;
  };

  return Init()
    .meta({})
    .model(() => ({
      formValue: null as null | O.Assign<Product, [FormProductDetailsExtra]>,

      previewImageBgColor: null as null | 'white' | 'black',

      selectedImagePreviewId: null as number | null,

      uploadedImages: {} as { [key: number]: MediaAsset },
      selectedCatagories: [] as number[],

      getFullProductError: null as null | Error,
      getFullProductLoading: false,

      putLoading: false,
      putError: null as null | Error,

      uploadImageLoading: false,
      uploadImageError: null as null | Error
    }))
    .views(({ state }) => {
      const mediaAssetForPreview = (state.selectedImagePreviewId && state.uploadedImages[state.selectedImagePreviewId]) || null;
      const isPreviewDefault = state.formValue && mediaAssetForPreview && mediaAssetForPreview.id === state.formValue.defaultMedia.id;

      return { allCategories: allCategories.get(), mediaAssetForPreview, isPreviewDefault, inCategoeyMode };
    })
    .actions(({ state, computed, clear }) => {
      const getFullProduct = async (id: number) => {
        state.getFullProductLoading = true;
        try {
          const [{ data: product }, { data: catagories }, { data: images }] = await Promise.all([
            apiService.productsApi().getProductById(id),
            apiService.productsApi().getProductCategoriesByProductId(id),
            apiService.productsApi().getProductMediaByProductId(id)
          ]);

          const defaultMedia = product.defaultMedia || { id: null };

          const maybeDetails = ProductDetailsSchema.decode(product.details);

          state.formValue = {
            ...product,
            defaultMedia,
            details: isRight(maybeDetails) ? maybeDetails.right : defaultValue
          };

          state.selectedCatagories = catagories.map(c => c.id);

          state.uploadedImages = images.reduce((acc, currImg) => ({ ...acc, [currImg.id]: currImg }), {});

          if (defaultMedia.id) {
            state.selectedImagePreviewId = defaultMedia.id;
          }
        } catch (error) {
          state.getFullProductError = error;
          modalService.error({ title: 'Failed to get full product!' });
          console.error(error);
        } finally {
          state.getFullProductLoading = false;
        }
      };

      return {
        getFullProduct,
        async put() {
          const formValue = state.formValue;
          if (formValue && formValue.defaultMedia.id) {
            state.putLoading = true;
            try {
              const payload = {
                ...formValue,
                status: EntityStatus.PUBLISH,
                defaultMediaRef: { id: formValue.defaultMedia && formValue.defaultMedia.id }
              };

              const { data: createdProduct } = await apiService.productsApi().updateProductById(formValue.id, payload);

              if (state.selectedCatagories.length) {
                await apiService.productsApi().updateProductCategories(
                  createdProduct.id,
                  state.selectedCatagories.map(i => ({ id: Number(i) }))
                );
              }
            } catch (error) {
              state.putError = error;
              modalService.error({ title: 'Failure Trying to Persist Product' });
            } finally {
              state.putLoading = false;
            }
          }
        },
        cancel() {
          onFormEnd();
          clear();
        },
        uploadImage(file: Blob) {
          if (!state.formValue) return;
          state.uploadImageError = null;
          const modal = modalService.info({
            title: 'Upload in Progress',
            okText: 'Loading',
            maskClosable: false,
            keyboard: false,
            okButtonProps: {
              loading: true
            }
          });
          apiService
            .productsApi()
            .addProductMedia(state.formValue.id, file)
            .then(({ data }) => {
              state.uploadedImages = data.reduce((acc, currMedia) => ({ ...acc, ...{ [currMedia.id]: currMedia } }), {});

              if (state.formValue) {
                return apiService
                  .productsApi()
                  .getProductById(state.formValue.id)
                  .then(({ data }) => {
                    if (state.formValue && state.formValue.defaultMedia.id === null) {
                      state.formValue = { ...state.formValue, defaultMedia: data.defaultMedia };
                      if (!state.selectedImagePreviewId) {
                        state.selectedImagePreviewId = data.defaultMedia.id;
                      }
                    }
                    modal.update({
                      type: 'success',
                      title: 'Image Uploaded Successfully'
                    });
                  });
              }
            })
            .catch(error => {
              state.uploadImageError = error;
              modal.update({
                type: 'error',
                title: 'Image Upload Failure'
              });
            })
            .finally(() => {
              state.uploadImageLoading = false;
              modal.update({
                okText: 'OK',
                onOk: () => modal.destroy(),
                maskClosable: true,
                keyboard: true,
                okButtonProps: {
                  loading: false
                }
              });
            });
        },
        removeImageBackground(id: number) {
          const modal = modalService.info({
            title: 'Background Being Removed',
            okText: 'Loading',
            maskClosable: false,
            keyboard: false,
            okButtonProps: {
              loading: true
            }
          });

          apiService
            .mediaApi()
            .removeImageBackground(id)
            .then(({ data }) => {
              modal.update({
                type: 'success',
                title: 'Background Removed Successfully'
              });
              state.uploadedImages = { ...state.uploadedImages, [data.id]: data };
            })
            .catch(() => {
              modal.update({
                type: 'error',
                title: 'Background Removal Failure'
              });
            })
            .finally(() => {
              modal.update({
                okText: 'OK',
                onOk: () => modal.destroy(),
                maskClosable: true,
                keyboard: true,
                okButtonProps: {
                  loading: false
                }
              });
            });
        },
        removeImage(id: number) {
          if (state.formValue && state.formValue.id) {
            apiService
              .productsApi()
              .deleteProductMedia(state.formValue.id, id)
              .then(() => {
                delete state.uploadedImages[id];

                if (state.formValue && state.formValue.defaultMedia.id === id) {
                  state.formValue.defaultMedia.id = undefined;
                  const images = Object.values(state.uploadedImages);
                  if (images.length) {
                    state.formValue = { ...state.formValue, defaultMedia: images[0] };
                  }
                }
              })
              .catch(() => {
                modalService.error({ title: 'Failed to remove image' });
              });
          }
        },
        onChange(change: Partial<typeof state.formValue>) {
          if (!state.formValue) {
            return;
          }
          state.formValue = { ...state.formValue, ...change };
        },
        onCatagorySelect(v: Array<number>) {
          state.selectedCatagories = v;
        },
        onImagePreviewSelect(id: number) {
          state.selectedImagePreviewId = id;
        },
        onPreviewBgcolor(newColor: typeof state.previewImageBgColor) {
          state.previewImageBgColor = newColor;
        },
        clear
      };
    })
    .init(({ state, methods }) => {
      autorun(
        () => {
          const formValue = state.formValue;
          const categories = state.selectedCatagories;
          if (formValue && categories) {
            methods.put();
          }
        },
        { delay: 600 }
      );

      idToEdit.observe(({ newValue }) => {
        if (newValue) {
          methods.getFullProduct(newValue);
        } else {
          methods.clear();
        }
      }, true);
    });
}

export type VmType = GetVmType<typeof CreateProductPutVM>;
