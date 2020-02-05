import React from 'react';
import { Button, Icon } from 'antd';
import { InputTextBox } from 'components/Inputs/CustomInputs';
import { HiddenFileInput } from 'components/files-inputs/HiddenFileInput';
import { StringRow } from 'components/Inputs/CustomInputs';
import { IComputedValue } from 'mobx';
import { State, Computed, Methods, Run, View } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import CategoryModel from 'store/abstract/CategoryModel';
import { pipe } from 'utils/fp';

interface Params {
  initalize: IComputedValue<Boolean>;
  modalService: ModalServiceType;
  apiService: ApiServiceType;
  categoryModel: ReturnType<typeof CategoryModel>;
  onSucess: () => void;
  onCancel: () => void;
}

export default function({ apiService, modalService, initalize, onSucess, onCancel }: Params) {
  return pipe(
    State({
      newCatagoryDetails: {
        name: '',
        description: '',
        picture: null as null | Blob
      },
      postLoading: false,
      postError: null as null | Error
    }),
    Computed(() => ({ isVisible: initalize.get() })),
    Methods(({ state, clear, initialState, setState }) => ({
      post(newCatagory: typeof initialState.newCatagoryDetails) {
        const modal = modalService.info({
          title: 'Category Being Created',
          okText: null,
          maskClosable: false,
          keyboard: false,
          okButtonProps: {
            loading: true
          }
        });

        setState({ postLoading: true });

        apiService
          .catagoriesApi()
          .createCategory(newCatagory.name, newCatagory.description, newCatagory.picture || undefined)
          .then(() => {
            modal.update({
              type: 'success',
              title: 'Catagory Created Successfully'
            });
            onSucess();
            clear();
          })
          .catch(error => {
            setState({ postError: error });

            modal.update({
              type: 'error',
              title: 'Failed to Create Category'
            });
          })
          .finally(() => {
            setState({ postLoading: false });

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
      onChange(change: Partial<typeof initialState.newCatagoryDetails>) {
        setState({ newCatagoryDetails: { ...state.get().newCatagoryDetails, ...change } });
      },
      cancel() {
        clear();
        onCancel();
      }
    })),
    Run(({ clear }) => {
      initalize.observe(({ newValue, oldValue }) => {
        if (newValue && oldValue !== newValue) {
          clear();
        }
      }, true);
    }),
    View(({ state, methods }) => {
      const { newCatagoryDetails } = state.get();
      const { cancel, onChange, post } = methods;
      const preview = newCatagoryDetails.picture && URL.createObjectURL(newCatagoryDetails.picture);
      return (
        <section className='w-1/2 p-6 bb-slide-up'>
          <section>
            <StringRow value={newCatagoryDetails.name} onChange={e => onChange({ name: e })} placeholder='Category Name' />
          </section>
          <section>
            <InputTextBox
              value={newCatagoryDetails.description}
              onChange={e => onChange({ description: e })}
              title='Category Description'
              placeholder='Some details about the new category'
            />
          </section>
          <section>
            <HiddenFileInput onFile={picture => onChange({ picture })} className='cursor-pointer'>
              <span>{preview ? 'Change' : 'Add'} Category Image</span>
              <Icon type='plus' className='ml-1' />
            </HiddenFileInput>
          </section>
          {preview && (
            <section className='flex justify-start items-center mt-2'>
              <img src={preview} alt='Category' className='w-64 w-64 object-contain' />
              <span className='cursor-pointer text-gray-700 ml-1' onClick={() => onChange({ picture: null })}>
                <Icon type='close-circle' />
              </span>
            </section>
          )}
          <section className='mt-3'>
            <Button type='primary' disabled={false} onClick={() => post(newCatagoryDetails)} className='mr-1'>
              Submit
            </Button>
            <Button disabled={false} onClick={cancel}>
              Cancel
            </Button>
          </section>
        </section>
      );
    })
  );
}
