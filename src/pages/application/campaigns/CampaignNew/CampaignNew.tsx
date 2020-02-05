import React from 'react';
import { IComputedValue } from 'mobx';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { pipe } from 'utils/fp';
import { EntityStatus, Campaign } from 'clientApi';
import { ApiServiceType } from 'store/abstract/ApiService';
import { Header1 } from 'components/typography';
import { StringRow } from 'components/Inputs/CustomInputs';
import { Dropdown, Menu, Icon, Button } from 'antd';

interface Params {
  isVisible: IComputedValue<boolean>;
  onFinish: (campaign?: Campaign) => void;
  apiService: ApiServiceType;
  _handleError: (message: string, error: Error) => void;
}

export default function({ isVisible, onFinish, apiService, _handleError }: Params) {
  return pipe(
    State({
      name: '',
      status: EntityStatus.DRAFT
    }),

    Computed(({ state }) => ({
      isVisible: isVisible.get(),
      isValid: state.get().name.length !== 0
    })),

    Methods(({ state, setState, initialState }) => {
      return {
        async post() {
          try {
            const { data } = await apiService.campaignApi().createCampaign({
              config: {},
              name: state.get().name,
              status: state.get().status
            });
            onFinish(data);
          } catch (e) {
            _handleError('Failed to create campign', e);
          }
        },
        cancel() {
          onFinish();
        }
      };
    }),

    Run(({ clear, state, methods }) => {
      isVisible.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) {
          clear();
        }
      }, true);
    }),

    View(({ state, setState, methods, computed }) => {
      return (
        <section className='h-full'>
          <Header1>Create New Campaign</Header1>

          <section className='mb-2 max-w-xl'>
            <StringRow onChange={name => setState({ name })} value={state.get().name} placeholder='Name' />
          </section>

          <section className='mb-4 max-w-xs'>
            <Dropdown
              placement='bottomLeft'
              trigger={['click']}
              overlay={
                <Menu>
                  {Object.values(EntityStatus).map(status => (
                    <Menu.Item key={status} className='capitalize' onClick={() => setState({ status })}>
                      {status.toLowerCase()}
                    </Menu.Item>
                  ))}
                </Menu>
              }>
              <section className='capitalize cursor-pointer'>
                <span>{state.get().status.toLowerCase()}</span>
                <Icon type='down' className='align-middle ml-1' />
              </section>
            </Dropdown>
          </section>

          <section>
            <Button onClick={methods.post} type='primary' className='mr-4' disabled={computed.get().isValid === false}>
              Create
            </Button>
            <Button onClick={methods.cancel}>Cancel</Button>
          </section>
        </section>
      );
    })
  );
}
