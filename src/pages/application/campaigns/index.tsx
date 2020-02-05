import React from 'react';
import { IComputedValue, computed as mobxComputed } from 'mobx';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State, Children } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { AppSubHeader } from '../application-sub-header';
import CampaignItem from './CampaignItem/CampaignItem';
import CampaignList from './CampaignList';
import { InitLogger } from 'utils/Logger';
import { initInternals } from './internals';
import { TemplateServiceType } from 'store/abstract/TemplateService';
import TemplateVM from 'components/template-editor/template-editor-vm';
import { MediaAsset, Product, Visibility, Campaign } from 'clientApi';
import CampaignNew from './CampaignNew/CampaignNew';
import { observer } from 'mobx-react';

export const log = InitLogger({ dirname: 'pages/application/campaign', filename: 'index.tsx' });

type TemplateVmType = ReturnType<typeof TemplateVM>;

export type Params = {
  currView: IComputedValue<'LIST' | 'NEW' | number | null>;
  selectView: (view: number | 'LIST' | 'NEW') => void;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
  templateService: TemplateServiceType;
  stickers: IComputedValue<MediaAsset[]>;
  backgrounds: IComputedValue<MediaAsset[]>;
  products: IComputedValue<Product[]>;
};

export default function({ currView, selectView, apiService, modalService, templateService, stickers, backgrounds, products }: Params) {
  return pipe(
    State(
      {
        campaigns: [] as ReturnType<typeof CampaignItem>[],
        userTemplates: [] as TemplateVmType[]
      },
      { deep: false }
    ),

    Computed(({ state }) => ({
      currView: currView.get(),
      isVisible: currView.get() !== null,
      currCampaign: state.get().campaigns.find(i => i.state.get().campaign.id === currView.get())
    })),

    Methods(({ state, setState }) => {
      const { _Campaign, _handleError, _postCampaign, InitTemplateVM } = initInternals({
        templateService,
        apiService,
        stickers,
        backgrounds,
        products,
        userTemplates: mobxComputed(() => state.get().userTemplates),
        modalService,
        currView,
        log
      });

      return {
        _handleError,
        _Campaign,
        setView(selectedId: number | null) {
          selectView(selectedId === null ? 'LIST' : selectedId);
        },
        remove: async (id: number) => {
          try {
            await apiService.campaignApi().deleteCampaign(id);
            const items = state.get().campaigns.filter(i => i.state.get().campaign.id !== id);
            setState({ campaigns: items });
          } catch (e) {
            _handleError('Failed to delete campaign', e);
          }
        },
        add: async () => {
          try {
            const { data } = await _postCampaign();
            setState({ campaigns: [_Campaign(data), ...state.get().campaigns] });
            selectView(data.id);
          } catch (e) {
            _handleError('Failed to create campign', e);
          }
        },
        getAll: async () => {
          try {
            const { data: campaignsData } = await apiService.campaignApi().getUserCampaigns();
            const userTemplatesData = await templateService.getTemplatesPaged(undefined, 1, 20, Visibility.USER);

            const campaigns = campaignsData.map(_Campaign);
            const userTemplates = userTemplatesData.map(InitTemplateVM);

            setState({
              campaigns,
              userTemplates
            });
          } catch (e) {
            _handleError('Failed to fetch campaigns', e);
          }
        }
      };
    }),

    Run(({ methods }) => {
      currView.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) methods.getAll();
      }, true);
    }),

    Children(({ state, computed, methods: { setView, remove, _Campaign, _handleError }, setState }) => ({
      List: CampaignList({
        campaigns: mobxComputed(() => state.get().campaigns),
        isVisible: mobxComputed(() => currView.get() === 'LIST'),
        onSelect: setView,
        onDelete: remove
      }),
      Item: observer(() => {
        const currCampaign = computed.get().currCampaign;
        return currCampaign ? <currCampaign.Render /> : null;
      }),
      New: CampaignNew({
        apiService,
        _handleError,
        onFinish: (campaign?: Campaign) => {
          if (campaign) {
            setState({ campaigns: [_Campaign(campaign), ...state.get().campaigns] });
          }
          selectView('LIST');
        },
        isVisible: mobxComputed(() => currView.get() === 'NEW')
      })
    })),

    View(({ state, computed, methods: { setView, add }, children: { List, Item, New }, setState }) => {
      return (
        <section className='h-full'>
          <AppSubHeader
            listName='Campaigns'
            createName='create'
            selectedView={currView.get() === 'NEW' ? 'ITEM' : 'LIST'}
            setView={v => {
              if (v === 'LIST') {
                selectView('LIST');
              } else {
                selectView('NEW');
              }
            }}
          />
          <section style={{ height: 'calc(100% - 3rem)' }} className='overflow-y-scroll p-6 bb-slide-up'>
            <List.Render />
            <Item />
            <New.Render />
          </section>
        </section>
      );
    })
  );
}
