import React from 'react';
import { IComputedValue } from 'mobx';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { InitLogger } from 'utils/Logger';
import { StringRow } from 'components/Inputs/CustomInputs';
import { MediaLicense } from 'clientApi';
import { Header1 } from 'components/typography';
import { Button } from 'antd';
import { getRandomInt } from 'utils/utils';

export const log = InitLogger({ dirname: 'pages/application/licenses', filename: 'licenses.tsx' });

interface Params {
  isVisible: IComputedValue<boolean>;
  selectView: (view: number | 'NEW') => void;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
  onFinish: () => void;
}

export default function({ isVisible, selectView, modalService, apiService, onFinish }: Params) {
  const log = InitLogger({ dirname: 'application/logger', filename: 'LicenseNew.tsx' });
  return pipe(
    State<MediaLicense>({ id: getRandomInt(100000) }),

    Computed(({ state }) => ({
      isVisible: isVisible.get(),
      isValid: [undefined, ''].includes(state.get().licenseName) === false
    })),

    Methods(({ state, setState, computed }) => ({
      async createLicense() {
        if (computed.get().isValid) {
          try {
            console.log({ d: state.get() });
            await apiService.licensesApi().createLicense(state.get());
            modalService.success({ title: 'License Created Successfully' });
            onFinish();
          } catch (e) {
            log.error('Failed to create License', e);
            modalService.error({ title: 'Failed to Create License' });
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
          <Header1>Create License</Header1>
          <StringRow onChange={licenseName => setState({ licenseName })} value={state.get().licenseName} placeholder='Name' />
          <StringRow onChange={licenseUrl => setState({ licenseUrl })} value={state.get().licenseUrl} placeholder='URL' />
          <StringRow onChange={copyright => setState({ copyright })} value={state.get().copyright} placeholder='Copyright' />

          <section className='flex justify-between items-center w-40 mt-3'>
            <Button onClick={methods.createLicense} type='primary' disabled={computed.get().isValid === false}>
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
