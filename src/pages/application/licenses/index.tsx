import React from 'react';
import { IComputedValue, computed } from 'mobx';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State, Children } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { AppSubHeader } from '../application-sub-header';
import LicenseList from './LicencesList';
import LicenseNew from './LicensesNew';
import { InitLogger } from 'utils/Logger';

export const log = InitLogger({ dirname: 'pages/application/licenses', filename: 'licenses.tsx' });

export type Params = {
  isVisible: IComputedValue<boolean>;
  currView: IComputedValue<'LIST' | 'NEW' | number | null>;
  selectView: (view: number | 'LIST' | 'NEW') => void;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
};

export default function({ isVisible, currView, selectView, apiService, modalService }: Params) {
  return pipe(
    State({}),

    Computed(() => ({
      isVisible: isVisible.get()
    })),

    Methods(({ state, setState }) => {
      return {};
    }),

    Children(() => ({
      LicensesNew: LicenseNew({
        apiService,
        modalService,
        isVisible: computed(() => currView.get() === 'NEW'),
        selectView: v => selectView(v),
        onFinish: () => selectView('LIST')
      }),
      LicensesList: LicenseList({ apiService, modalService, isVisible: computed(() => currView.get() === 'LIST'), selectView: v => selectView(v) })
    })),

    Run(() => {}),

    View(({ children: { LicensesList: list, LicensesNew } }) => {
      return (
        <section className='h-full'>
          <AppSubHeader
            listName='Licenses'
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
            <list.Render />
            <LicensesNew.Render />
          </section>
        </section>
      );
    })
  );
}
