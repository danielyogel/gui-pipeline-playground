import React from 'react';
import { IComputedValue } from 'mobx';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { InitLogger } from 'utils/Logger';
import { MediaLicense } from 'clientApi';
import { Tooltip, Icon } from 'antd';

export const log = InitLogger({ dirname: 'pages/application/licenses', filename: 'licenses.tsx' });

interface Params {
  isVisible: IComputedValue<boolean>;
  selectView: (view: number | 'NEW') => void;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
}

export default function({ isVisible, selectView, modalService, apiService }: Params) {
  return pipe(
    State({
      licenses: [] as MediaLicense[]
    }),

    Computed(() => ({
      isVisible: isVisible.get()
    })),

    Methods(({ setState }) => ({
      async getAll() {
        try {
          const { data } = await apiService.licensesApi().getLicenses();
          setState({ licenses: data });
        } catch (error) {
          log.error('Failed to Fetch Licenses', error);
          modalService.error({ title: 'Failed to Fetch Licenses' });
        }
      },
      async removeById(id: number) {
        try {
          await apiService.licensesApi().deleteLicense(id);
          modalService.success({ title: 'License Removed Successfully' });
        } catch (error) {
          log.error('Failed to remove License ' + id, error);
          modalService.error({ title: 'Failed to remove License ' + id });
        }
      }
    })),

    Run(({ methods }) => {
      isVisible.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) methods.getAll();
      }, true);
    }),

    View(({ state, methods }) => {
      const { licenses } = state.get();
      return (
        <section className='h-full'>
          {licenses.map(l => (
            <div className='mx-6 my-8 shadow-md p-5 overflow-hidden' key={l.id}>
              <section>
                <span>ID: </span>
                <b className='truncate' title={l.id?.toString()}>
                  {l.id}
                </b>
              </section>
              <section>
                <span>Name: </span>
                <b className='truncate' title={l.licenseName}>
                  {l.licenseName}
                </b>
              </section>

              <section>
                <span>URL: </span>
                <b className='truncate' title={l.licenseUrl}>
                  {l.licenseUrl}
                </b>
              </section>

              <section>
                <span>Copyright: </span>
                <b className='truncate' title={l.copyright}>
                  {l.copyright}
                </b>
              </section>
              <Tooltip title='Remove License' placement='topLeft'>
                <div
                  className='text-black text-center cursor-pointer w-4 mt-3 flex-shrink-0 flex cursor-pointer text-bb-light-purple hover:text-bb-dark-purple'
                  style={{ transition: 'color 0.2s ease-in-out' }}
                  onClick={e => {
                    e.stopPropagation();
                    l.id && methods.removeById(l.id);
                  }}
                  title='Remove'>
                  <span>Remove</span>
                  <Icon type='delete' theme='filled' className='align-bottom ml-1 relative' style={{ top: '2px' }} />
                </div>
              </Tooltip>
            </div>
          ))}
        </section>
      );
    })
  );
}
