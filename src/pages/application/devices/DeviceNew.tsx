import React from 'react';
import { IComputedValue } from 'mobx';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { InitLogger } from 'utils/Logger';
import { StringRow } from 'components/Inputs/CustomInputs';
import { StreamingDeviceRequest } from 'clientApi';
import { Header1 } from 'components/typography';
import { Button } from 'antd';

export const log = InitLogger({ dirname: 'pages/application/devices', filename: 'DeviceNew.tsx' });

interface Params {
  isVisible: IComputedValue<boolean>;
  selectView: (view: number | 'NEW') => void;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
  onFinish: () => void;
}

export default function({ isVisible, modalService, apiService, onFinish }: Params) {
  return pipe(
    State<StreamingDeviceRequest>({ label: '', name: '' }),

    Computed(({ state }) => ({
      isVisible: isVisible.get(),
      isValid: [undefined, ''].includes(state.get().name) === false
    })),

    Methods(({ state, setState, computed }) => ({
      async createDevice() {
        if (computed.get().isValid) {
          try {
            await apiService.deviceApi().createDevice(state.get());
            modalService.success({ title: 'Device Created Successfully' });
            onFinish();
          } catch (e) {
            log.error('Failed to create Device', e);
            modalService.error({ title: 'Failed to Create Device' });
          }
        }
      }
    })),

    Run(({ clear }) => {
      isVisible.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) clear();
      });
    }),

    View(({ state, computed, methods, setState }) => {
      return (
        <section className='h-full'>
          <Header1>Create Device</Header1>
          <StringRow onChange={name => setState({ name })} value={state.get().name} placeholder='Name' />
          <StringRow onChange={label => setState({ label })} value={state.get().label} placeholder='Label' />

          <section className='flex justify-between items-center w-40 mt-3'>
            <Button onClick={methods.createDevice} type='primary' disabled={computed.get().isValid === false}>
              Create
            </Button>
            <Button onClick={onFinish} type='default'>
              Cancel
            </Button>
          </section>
        </section>
      );
    })
  );
}
