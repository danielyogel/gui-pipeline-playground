import React from 'react';
import { IComputedValue } from 'mobx';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { InitLogger } from 'utils/Logger';
import { Tooltip, Icon } from 'antd';
import DeviceEdit from './DeviceEdit';
import { StreamingDevice } from 'clientApi';

export const log = InitLogger({ dirname: 'pages/application/devices', filename: 'DeviceList.tsx' });

interface Params {
  isVisible: IComputedValue<boolean>;
  reload: IComputedValue<boolean>;
  selectView: (view: number | 'NEW' | 'LIST') => void;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
  InitDeviceVM: (device: StreamingDevice) => ReturnType<typeof DeviceEdit>;
}

export default function({ isVisible, modalService, apiService, selectView, InitDeviceVM, reload }: Params) {
  return pipe(
    State(
      {
        devices: [] as ReturnType<typeof DeviceEdit>[]
      },
      { deep: false }
    ),

    Computed(() => ({
      isVisible: isVisible.get()
    })),

    Methods(({ state, setState }) => ({
      async getAll() {
        try {
          setState({
            devices: (await apiService.deviceApi().getAllDevices()).data.map(InitDeviceVM)
          });
        } catch (error) {
          log.error('Failed to Fetch Devices', error);
          modalService.error({ title: 'Failed to Fetch Devices' });
        }
      },
      async removeById(id: number) {
        try {
          await apiService.deviceApi().deleteDevice(id);
          setState({ devices: state.get().devices.filter(d => d.state.get().device.id !== id) });
          modalService.success({ title: 'Device Removed Successfully' });
        } catch (error) {
          log.error('Failed to remove Device ' + id, error);
          modalService.error({ title: 'Failed to remove Device ' + id });
        }
      }
    })),

    Run(({ methods }) => {
      reload.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) methods.getAll();
      }, true);
    }),

    View(({ state, methods, setState }) => {
      const { devices } = state.get();
      return (
        <section className='h-full'>
          {devices.map(currDevice => {
            const deviceId = currDevice.state.get().device.id;
            return (
              <div
                className='mx-6 my-8 shadow-md p-5 overflow-hidden cursor-pointer'
                key={deviceId}
                onClick={() => deviceId !== undefined && selectView(deviceId)}>
                {Object.entries(currDevice.state.get().device).map(([key, value]) => (
                  <section key={key}>
                    <span className='capitalize'>{key.toLowerCase()}: </span>
                    <b className='truncate' title={value?.toString()}>
                      {value}
                    </b>
                  </section>
                ))}

                <Tooltip title='Remove Device' placement='topLeft'>
                  <div
                    className='text-black text-center cursor-pointer w-4 mt-3 flex-shrink-0 flex cursor-pointer text-bb-light-purple hover:text-bb-dark-purple'
                    style={{ transition: 'color 0.2s ease-in-out' }}
                    onClick={e => {
                      e.stopPropagation();
                      deviceId && methods.removeById(deviceId);
                    }}
                    title='Remove'>
                    <span>Remove</span>
                    <Icon type='delete' theme='filled' className='align-bottom ml-1 relative' style={{ top: '2px' }} />
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </section>
      );
    })
  );
}
