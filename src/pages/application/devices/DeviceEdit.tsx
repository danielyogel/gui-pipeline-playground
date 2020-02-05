import React from 'react';
import { IComputedValue, autorun } from 'mobx';
import { pipe, deepEqual } from 'utils/fp';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { InitLogger } from 'utils/Logger';
import { StringRow } from 'components/Inputs/CustomInputs';
import { StreamingDevice, Campaign } from 'clientApi';
import { Header2 } from 'components/typography';
import { Icon } from 'antd';
import { O } from 'ts-toolbelt';
import { generateRandomColor } from 'utils/utils';
import { If, classNames } from 'react-extras';

export const log = InitLogger({ dirname: 'pages/application/devices', filename: 'DeviceEdit.tsx' });

interface Params {
  device: StreamingDevice;
  isVisible: IComputedValue<boolean>;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
  userCampaigns: IComputedValue<Campaign[]>;
  onFinish: () => void;
}

export default function({ isVisible, modalService, apiService, onFinish, device, userCampaigns }: Params) {
  return pipe(
    State({ device, deviceCampagins: [] as Campaign[] }),

    Computed(({ state }) => {
      const deviceCampagins = state.get().deviceCampagins;
      return {
        isVisible: isVisible.get(),
        isValid: isValid(state.get().device),
        userCampaignsForDisplay: userCampaigns.get().filter(currCampaign => !deviceCampagins.find(c => c.id === currCampaign.id))
      };
    }),

    Methods(({ state, setState, computed, initialState }) => {
      return {
        onDeviceChange(changes: Partial<typeof initialState['device']>) {
          setState({ device: { ...state.get().device, ...changes } });
        },
        onSelect(campaign: Campaign) {
          setState({ deviceCampagins: [campaign, ...state.get().deviceCampagins] });
        },
        onDelete(id: number) {
          setState({ deviceCampagins: state.get().deviceCampagins.filter(d => d.id !== id) });
        },
        async getDeviceCampagins() {
          if (!device.id) return;
          try {
            setState({
              deviceCampagins: (await apiService.deviceApi().getDeviceCampaigns(device.id)).data
            });
          } catch (e) {
            log.error('Failed to get Device Campaigns', e);
            modalService.error({ title: 'Something Went Wrong' });
          }
        },
        async updateDeviceCampagins() {
          if (!device.id) return;
          try {
            await apiService.deviceApi().updateDeviceCampaigns(device.id, state.get().deviceCampagins);
          } catch (e) {
            log.error('Failed to update Device Campaigns', e);
            modalService.error({ title: 'Failed to update Device Campaigns' });
          }
        },
        async updateDevice() {
          const { device } = state.get();
          if (isValid(device)) {
            try {
              await apiService.deviceApi().updateDeviceById(device.id, device);
            } catch (e) {
              log.error('Failed to create Device', e);
              modalService.error({ title: 'Failed to Edit Device' });
            }
          }
        }
      };
    }),

    Run(({ state, clear, methods }) => {
      isVisible.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) {
          clear();
          methods.getDeviceCampagins();
        }
      }, true);

      state.observe(({ oldValue, newValue }) => {
        if (deepEqual(oldValue?.deviceCampagins, newValue.deviceCampagins) === false) {
          methods.updateDeviceCampagins();
        }
      });

      let lastSynced = state.get().device;
      autorun(
        async () => {
          if (!deepEqual(lastSynced, state.get().device)) {
            try {
              await methods.updateDevice();
              lastSynced = state.get().device;
            } catch {}
          }
        },
        { delay: 1000 }
      );
    }),

    View(({ state, computed, methods: { onDelete, onSelect, onDeviceChange } }) => {
      return (
        <section className='h-full'>
          <section className='mb-6'>
            <Header2>Edit Device</Header2>
            <StringRow onChange={name => onDeviceChange({ name })} value={state.get().device.name} placeholder='Name' />
            <StringRow onChange={label => onDeviceChange({ label })} value={state.get().device.label} placeholder='Label' />
          </section>

          <section className='mb-6'>
            <b>Device Campaigns</b>
            <section className='flex flex-wrap'>
              <If condition={state.get().deviceCampagins.length === 0}>
                <section className='px-2 py-6'>
                  <span>No Device Campaigns</span>
                </section>
              </If>
              <CampaignList items={state.get().deviceCampagins} onRemove={onDelete} />
            </section>
          </section>

          <section>
            <b>All Campaigns</b>
            <section className='flex flex-wrap'>
              <If condition={computed.get().userCampaignsForDisplay.length === 0}>
                <section className='px-2 py-6'>
                  <span>All Selected</span>
                </section>
              </If>

              <CampaignList items={computed.get().userCampaignsForDisplay} onSelect={onSelect} />
            </section>
          </section>
        </section>
      );
    })
  );
}

function isValid(device: StreamingDevice): device is O.Required<StreamingDevice, 'name' | 'id'> {
  return [undefined, ''].includes(device.name) === false && device.id !== undefined;
}

const CampaignList = React.memo(
  function CampaignList({
    items,
    onSelect,
    onRemove
  }: {
    items: Campaign[];
    onSelect?: (campaign: Campaign) => void;
    onRemove?: (id: number) => void;
  }) {
    return (
      <>
        {items.map(campaign => {
          const CAMPAIGN_ID = `Campaign ${campaign.id}`;
          const CAMPAIGN_NAME_SHORT = campaign.name.slice(0, 6);
          return (
            <div
              className={classNames('m-2 p-2 w-48 h-48 relative group', { 'cursor-pointer': !!onSelect })}
              onClick={() => onSelect && onSelect(campaign)}
              key={campaign.id}
              style={{ backgroundColor: generateRandomColor() }}>
              <section className='truncate font-bold'>{CAMPAIGN_NAME_SHORT}</section>
              <section>{CAMPAIGN_ID}</section>
              {onRemove && (
                <Icon
                  onClick={e => {
                    e.stopPropagation();
                    onRemove(campaign.id);
                  }}
                  type='delete'
                  theme='filled'
                  title='Remvoe'
                  className='absolute color-red pointer text-bb-light-purple opacity-0 group-hover:opacity-100 bb-transition-all z-10 text-xl'
                  style={{ top: '10px', right: '10px' }}
                />
              )}
            </div>
          );
        })}
      </>
    );
  },
  (prevProps, nextProps) => prevProps.items.length === nextProps.items.length
);
