import React from 'react';
import screenfull from 'screenfull';
import { If, classNames } from 'react-extras';
import { IComputedValue, computed as MobxComputed } from 'mobx';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { View, Run, Methods, Computed, State, Ref } from 'utils/Init';
import { pipe, Either, Array, arraymove, Option, flow } from 'utils/fp';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { Campaign, EntityStatus } from 'clientApi';
import { InitLogger } from 'utils/Logger';
import { initErrorHandler } from '../internals';
import { Header1, Header2 } from 'components/typography';
import TemplateVM from 'components/template-editor/template-editor-vm';
import { TemplateV } from 'schemas/template.interfaces';
import { TemplateFull } from 'store/abstract/TemplateService';
import { Icon, Dropdown, Menu, Input } from 'antd';
import UserTemplateList from './UserTemplateList';
import CampaignTemplateList from './CampaignTemplateList';
import { Observer } from 'mobx-react';
import TemplateEditor from 'components/template-editor/template-editor';
import { NumberRow } from 'components/Inputs/CustomInputs';
import { Radio } from 'antd';
import { O } from 'ts-toolbelt';

const log = InitLogger({ dirname: 'pages/application/campaign', filename: 'CampaignItem.tsx' });

type TemplateVmType = ReturnType<typeof TemplateVM>;

interface Params {
  campaign: Campaign;
  InitTemplateVM: (template: TemplateFull) => TemplateVmType;
  userTemplates: IComputedValue<TemplateVmType[]>;
  isVisible: IComputedValue<boolean>;
  reload: IComputedValue<boolean>;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
}

export default function({ campaign, InitTemplateVM, userTemplates, isVisible, reload, apiService, modalService }: Params) {
  const { _handleError } = initErrorHandler(log, modalService);

  return pipe(
    State(
      {
        campaign: assignCampaignDefaults(campaign),
        templates: [] as TemplateVmType[],
        playback: -1,
        isfullScreen: false
      },
      { deep: false }
    ),

    Computed(({ state }) => {
      const _userTemplates = userTemplates.get();
      const _campaignTemplates = state.get().templates;
      return {
        isVisible: isVisible.get(),
        userTemplatesForDisplay: _userTemplates.filter(t => !_campaignTemplates.find(({ state: { id } }) => id === t.state.id)),
        campaignTemplatesForDisplay: state.get().templates
      };
    }),

    Ref(),

    Methods(({ state, setState, initialState, _ref }) => {
      let intervalId = null as null | NodeJS.Timeout;
      return {
        play(start: boolean) {
          if (start) {
            setState({ playback: 0 });
            const miliSeconds = state.get().campaign.config.templateDurationSec * 1000;
            let freshCampaignFromServer = null as null | Campaign;
            intervalId = setInterval(() => {
              const reachedEnd = state.get().playback >= state.get().templates.length - 1;
              setState({ playback: reachedEnd ? 0 : state.get().playback + 1 });
              if (reachedEnd) {
                if (freshCampaignFromServer) {
                  setState({ campaign: assignCampaignDefaults(freshCampaignFromServer) });
                  freshCampaignFromServer = null;
                }
                apiService
                  .campaignApi()
                  .getCampaignById(campaign.id)
                  .then(({ data }) => {
                    freshCampaignFromServer = data;
                  })
                  .catch(e => {
                    log.error('Failure while trying to refetch campaign in playback', e);
                  });
              }
            }, miliSeconds);
            if (screenfull.isEnabled) {
              !screenfull.isFullscreen && screenfull.request(_ref.current || undefined);
            }
          } else {
            intervalId !== null && clearInterval(intervalId);
            setState({ playback: -1 });
            if (screenfull.isEnabled) {
              screenfull.isFullscreen && screenfull.exit();
            }
          }
        },
        async setCampaignConfig(config: Partial<typeof initialState['campaign']['config']>) {
          try {
            const campaign = { ...state.get().campaign, config: { ...state.get().campaign.config, ...config } };
            setState({ campaign });
            await apiService.campaignApi().updateCampaignById(campaign.id, { ...state.get().campaign });
          } catch (error) {
            log.error('Failed to update campaign config', error);
            modalService.error({ title: 'Campaign Update Failure' });
          }
        },
        async refreshCampaign() {
          try {
            const { data } = await apiService.campaignApi().getCampaignById(campaign.id);
            setState({ campaign: assignCampaignDefaults(data) });
            if (data.templates) {
              pipe(
                data.templates,
                Array.filterMap(
                  flow(
                    TemplateV.decode,
                    Either.mapLeft(E => log.validationError('invalid "getTemplatesPaged" res', E)),
                    Either.map(InitTemplateVM),
                    Option.fromEither
                  )
                ),
                templates => setState({ templates })
              );
            }
          } catch (error) {
            log.error('Failed to getCampignById', error);
            modalService.error({ title: 'Something Went Wrong' });
          }
        },
        async setCampaignNameStatus(changes: Partial<typeof initialState['campaign']>) {
          try {
            const campaign = { ...state.get().campaign, ...changes };
            setState({ campaign });
            await apiService.campaignApi().updateCampaignById(campaign.id, { ...state.get().campaign });
          } catch (error) {
            log.error('Failed to update campaign', error);
            modalService.error({ title: 'Campaign Update Failure' });
          }
        },
        async addTemplate(templateVM: TemplateVmType, index: number) {
          try {
            const result = Array.insertAt(index, templateVM)(state.get().templates);
            if (Option.isSome(result)) {
              const templates = result.value;
              setState({ templates });
              await apiService.campaignApi().updateCampaignTemplates(
                campaign.id,
                templates.map(t => ({ id: t.state.id }))
              );
            } else {
              throw new Error('Failed to add template to list!');
            }
          } catch (e) {
            _handleError('Failed to add template to campaign', e);
          }
        },
        async removeTemplate(index: number) {
          try {
            const templates = Array.unsafeDeleteAt(index, state.get().templates);
            setState({ templates });
            const ids = templates.map(({ state: { id } }) => ({ id }));
            await apiService.campaignApi().updateCampaignTemplates(campaign.id, ids);
          } catch (e) {
            _handleError('Failed to remove template from campaign', e);
          }
        },
        async moveItem(fromIndex: number, toIndex: number) {
          try {
            const templates = arraymove(state.get().templates, fromIndex, toIndex);
            setState({ templates: [...templates] });
            const ids = templates.map(({ state: { id } }) => ({ id }));
            await apiService.campaignApi().updateCampaignTemplates(campaign.id, ids);
          } catch (e) {
            _handleError('Failed to move template in campaign', e);
          }
        }
      };
    }),

    Run(({ state, methods, _ref, setState }) => {
      reload.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) methods.refreshCampaign();
      }, true);

      state.observe(({ newValue }) => {
        if (newValue.isfullScreen && newValue.playback === -1) methods.play(true);
        if (!newValue.isfullScreen && newValue.playback > -1) methods.play(false);
      });

      if (screenfull.isEnabled) {
        screenfull.on('change', () => {
          if (screenfull.isEnabled && !screenfull.isFullscreen && state.get().isfullScreen) setState({ isfullScreen: false });
        });
      }
    }),

    View(
      ({
        state,
        computed,
        methods: { addTemplate, removeTemplate, moveItem, setCampaignConfig, setCampaignNameStatus },
        _ref,
        setState
      }) => {
        const CAMPAIGN_TEMPLATES_ID = 'CAMPAIGN_TEMPLATES_ID' as const;
        const USER_TEMPLATES_ID = 'USER_TEMPLATES_ID' as const;
        const isPlaying = state.get().playback !== -1;
        return (
          <section className='h-full'>
            <section className='flex justify-start items-baseline'>
              <Header1>Name:</Header1>
              <div>
                <Input
                  value={state.get().campaign.name}
                  onChange={e => setCampaignNameStatus({ name: e.target.value })}
                  placeholder={'lala'}
                  style={{ width: (state.get().campaign.name.length || 'lala'.length) * 11.6 + 'px', minWidth: '85px' }}
                  className='outline-none border-none truncate max-w-xs text-lg font-bold text-bb-dark-purple bg-transparent mr-1 pr-1 placeholder-gray-500'></Input>
              </div>
            </section>

            <section className='max-w-xs flex justify-start items-baseline'>
              <Header2>Status: </Header2>
              <div className='ml-4'>
                <Dropdown
                  placement='bottomLeft'
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {Object.values(EntityStatus).map(status => (
                        <Menu.Item key={status} className='capitalize' onClick={() => setCampaignNameStatus({ status })}>
                          {status.toLowerCase()}
                        </Menu.Item>
                      ))}
                    </Menu>
                  }>
                  <section className='capitalize cursor-pointer'>
                    <span>{state.get().campaign.status.toLowerCase()}</span>
                    <Icon type='down' className='align-middle ml-1' />
                  </section>
                </Dropdown>
              </div>
            </section>

            <section>
              <div className='p-6 my-6 text-4xl text-green-600 cursor-pointer hover:text-green-700 bb-transition-all inline-block'>
                <b className='mr-2'>Play</b>
                <Icon
                  type='play-circle'
                  className='align-middle'
                  theme='filled'
                  onClick={() => {
                    setState({ isfullScreen: true });
                  }}
                />
              </div>
              <section ref={_ref} className='relative'>
                <If condition={isPlaying}>
                  {state.get().templates.map((template, index) => (
                    <Observer key={template.state.id}>
                      {() => {
                        const showCurrTemplate = index === state.get().playback;
                        return (
                          <div
                            className={classNames('absolute bb-transition-opacity', {
                              'bb-slide-down-slow': showCurrTemplate && state.get().campaign.config.templateTransition === 'SLIDE'
                            })}
                            style={{
                              top: showCurrTemplate ? 0 : '100%',
                              bottom: showCurrTemplate ? 0 : '100%',
                              left: showCurrTemplate ? 0 : '100%',
                              right: showCurrTemplate ? 0 : '100%',
                              opacity: showCurrTemplate ? 1 : 0
                            }}>
                            <TemplateEditor {...template} computed={template.computed.get()} viewMode={true} />
                          </div>
                        );
                      }}
                    </Observer>
                  ))}
                </If>
              </section>
            </section>

            <DragDropContext
              onDragEnd={({ destination, source }) => {
                if (destination?.droppableId === USER_TEMPLATES_ID && source.droppableId === CAMPAIGN_TEMPLATES_ID) {
                  return removeTemplate(source.index);
                }

                if (destination?.droppableId === CAMPAIGN_TEMPLATES_ID && source.droppableId === USER_TEMPLATES_ID) {
                  const vmToAdd = computed.get().userTemplatesForDisplay[source.index];
                  if (vmToAdd) {
                    return addTemplate(vmToAdd, destination.index);
                  }
                }

                if (destination?.droppableId === CAMPAIGN_TEMPLATES_ID && source.droppableId === CAMPAIGN_TEMPLATES_ID) {
                  if (destination && destination.index !== source.index) {
                    return moveItem(source.index, destination.index); //TODO: move function into VM
                  }
                }
              }}>
              <section>
                <Header2>Campaign Templates</Header2>

                <section>
                  <section className='mb-4'>
                    <NumberRow
                      value={state.get().campaign.config?.templateDurationSec}
                      onChange={templateDurationSec => setCampaignConfig({ templateDurationSec })}
                      placeholder='Duration'
                    />
                  </section>
                  <section className='mb-4'>
                    <Radio.Group
                      value={state.get().campaign.config.templateTransition}
                      onChange={event => setCampaignConfig({ templateTransition: event.target.value })}>
                      <Radio.Button value={'FADE_IN' as const}>Fade in</Radio.Button>
                      <Radio.Button value={'SLIDE' as const}>Slide</Radio.Button>
                    </Radio.Group>
                  </section>
                </section>

                <section className='flex flex-wrap overflow-hidden pr-16'>
                  <Droppable droppableId={CAMPAIGN_TEMPLATES_ID} direction='horizontal'>
                    {(provided, snapshot) => {
                      const isListEmpty = computed.get().campaignTemplatesForDisplay.length === 0;
                      return (
                        <section
                          ref={provided.innerRef}
                          style={{ backgroundColor: isListEmpty /* || snapshot.isDraggingOver  */ ? 'white' : 'black' }}
                          {...provided.droppableProps}
                          className='flex overflow-y-auto'>
                          <CampaignTemplateList items={MobxComputed(() => computed.get().campaignTemplatesForDisplay)} />

                          <If condition={isListEmpty}>
                            <div className='mb-6'>
                              <b>Drag Templates Here</b>
                              <Icon type='drag' className='align-middle ml-1' />
                            </div>
                          </If>
                          {provided.placeholder}
                        </section>
                      );
                    }}
                  </Droppable>
                </section>
              </section>

              <section className='mt-6'>
                <Header2>User Templates</Header2>
                <Droppable droppableId={USER_TEMPLATES_ID} direction='horizontal'>
                  {(provided, snapshot) => {
                    const isListEmpty = computed.get().userTemplatesForDisplay.length === 0;

                    return (
                      <section
                        ref={provided.innerRef}
                        style={{ backgroundColor: snapshot.isDraggingOver ? 'white' : 'white' }}
                        {...provided.droppableProps}
                        className='flex overflow-hidden'>
                        <section className='flex flex-wrap'>
                          <UserTemplateList items={MobxComputed(() => computed.get().userTemplatesForDisplay)} />
                          <If condition={isListEmpty}>
                            <div className='mb-6'>
                              <b>Drag Templates Here</b>
                              <Icon type='drag' className='align-middle ml-1' />
                            </div>
                          </If>

                          {provided.placeholder}
                        </section>
                      </section>
                    );
                  }}
                </Droppable>
              </section>
            </DragDropContext>
          </section>
        );
      }
    )
  );
}

//
//  INTERNALS
//
const assignCampaignDefaults = (campaign: Campaign): O.Required<Campaign, 'config', 'deep'> => ({
  ...campaign,
  config: {
    templateTransition: campaign.config?.templateTransition || ('FADE_IN' as const),
    templateDurationSec: campaign.config?.templateDurationSec || 3
  }
});
