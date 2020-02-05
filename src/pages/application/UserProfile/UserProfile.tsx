import React from 'react';
import { IComputedValue } from 'mobx';
import { Modal, Button } from 'antd';

import { ApiServiceType } from 'store/abstract/ApiService';
import { State, Computed, Methods, View, Run } from 'utils/Init';
import { pipe } from 'utils/fp';
import { StringRow } from 'components/Inputs/CustomInputs';

type Params = {
  initalize: IComputedValue<boolean>;
  userId: IComputedValue<string | undefined>;
  apiService: ApiServiceType;
  onFinish: () => void;
};

export default function({ initalize, userId, apiService, onFinish }: Params) {
  return pipe(
    State({
      details: { email: '', userName: '', phone: '', language: '' },
      getUserByIdError: null as null | Error,
      getUserByIdLoading: false
    }),
    Computed(({ state }) => ({ isDisabled: state.get().details.email === 'd', isVisible: initalize.get() })),
    Methods(({ state, setState, initialState, clear }) => ({
      editState(changes: Partial<typeof initialState.details>) {
        state.get().details = { ...state.get().details, ...changes };
      },
      cancel() {
        onFinish();
      },
      updateUser(): void {
        const id = userId.get();
        if (id) {
          apiService
            .userApi()
            .updateUser({ ...state.get().details, id })
            .then(() => {
              Modal.success({
                content: 'Update Succses!',
                onOk: () => {
                  onFinish();
                }
              });
            })
            .catch(() => {
              Modal.error({
                title: 'Update Failed!'
              });
            });
        }
      },
      refresh(): void {
        clear();
        const id = userId.get();
        if (id) {
          apiService
            .userApi()
            .getUserById(id)
            .then(({ data }) => {
              const { id, ...dataNoId } = data;
              setState({ details: { ...state.get().details, ...dataNoId } });
            })
            .catch(error => (state.get().getUserByIdError = error))
            .finally(() => (state.get().getUserByIdLoading = false));
        }
      }
    })),
    Run(({ methods }) => {
      initalize.observe(({ newValue }) => {
        if (newValue) methods.refresh();
      }, true);
    }),
    View(({ state, computed, methods: { editState, updateUser, cancel } }) => {
      const { details } = state.get();
      const { isDisabled } = computed.get();
      return (
        <section className='m-4 bb-slide-up'>
          <header className='font-bold mb-4 text-xl'>Edit User</header>

          {Object.entries(details).map(([k, v]) => (
            <section key={k} className='mb-3'>
              <StringRow value={v} onChange={newValue => editState({ [k]: newValue })} placeholder={'enter ' + k} />
            </section>
          ))}

          <section className='mt-4 mb-3'>
            <Button type='primary' disabled={isDisabled} onClick={updateUser} className='mr-3'>
              Edit
            </Button>
            <Button type='default' disabled={isDisabled} onClick={cancel}>
              Cancel
            </Button>
          </section>
        </section>
      );
    })
  );
}
