import React from 'react';
import { IComputedValue, computed } from 'mobx';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State, Children } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { AppSubHeader } from '../application-sub-header';
import DeviceEdit from './DeviceEdit';
import DeviceList from './DeviceList';
import DeviceNew from './DeviceNew';
import { InitLogger } from 'utils/Logger';
import { Campaign, StreamingDevice } from 'clientApi';

export const log = InitLogger({ dirname: 'pages/application/devices', filename: 'index.tsx' });

export type Params = {
  currView: IComputedValue<'LIST' | 'NEW' | number | null>;
  selectView: (view: number | 'LIST' | 'NEW') => void;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
};

export default function({ currView, selectView, apiService, modalService }: Params) {
  return pipe(
    State({
      userCampaigns: [] as Campaign[]
    }),

    Computed(() => ({
      isVisible: currView.get() !== null
    })),

    Methods(({ state, setState }) => ({
      async getUserCampaigns() {
        try {
          setState({
            userCampaigns: (await apiService.campaignApi().getUserCampaigns()).data
          });
        } catch (e) {
          log.error('Failed to fetch user campaigns', e);
          modalService.error({ title: 'Something Went Wrong' });
        }
      }
    })),

    Children(({ state }) => {
      const InitDeviceVM = (device: StreamingDevice) =>
        DeviceEdit({
          device,
          apiService,
          modalService,
          onFinish: () => selectView('LIST'),
          isVisible: computed(() => currView.get() === device.id),
          userCampaigns: computed(() => state.get().userCampaigns)
        });
      const deviceList = DeviceList({
        apiService,
        modalService,
        isVisible: computed(() => currView.get() === 'LIST'),
        reload: computed(() => currView.get() !== null),
        selectView: v => selectView(v),
        InitDeviceVM
      });

      return {
        deviceNew: DeviceNew({
          apiService,
          modalService,
          isVisible: computed(() => currView.get() === 'NEW'),
          selectView: v => selectView(v),
          onFinish: () => {
            deviceList.methods.getAll();
            selectView('LIST');
          }
        }),
        deviceList
      };
    }),

    Run(({ methods }) => {
      currView.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) {
          methods.getUserCampaigns();
        }
      }, true);
    }),

    View(({ children: { deviceList, deviceNew } }) => {
      return (
        <section className='h-full'>
          <AppSubHeader
            listName='Devices'
            createName='create'
            selectedView={currView.get() === 'LIST' ? 'LIST' : 'ITEM'}
            setView={v => {
              if (v === 'LIST') {
                selectView('LIST');
              } else {
                selectView('NEW');
              }
            }}
          />
          <section style={{ height: 'calc(100% - 3rem)' }} className='overflow-y-scroll p-6 bb-slide-up'>
            <deviceList.Render />
            <deviceNew.Render />
            {deviceList.state.get().devices.map(vm => (
              <vm.Render key={vm.state.get().device.id} />
            ))}
          </section>
        </section>
      );
    })
  );
}
