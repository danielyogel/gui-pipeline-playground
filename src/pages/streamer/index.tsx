import React from 'react';
import { classNames } from 'react-extras';
import { IComputedValue } from 'mobx';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { pipe, Either } from 'utils/fp';
import { ApiServiceType } from 'store/abstract/ApiService';
import { InitLogger } from 'utils/Logger';
import TemplateVM from 'components/template-editor/template-editor-vm';
import { TemplateV } from 'schemas/template.interfaces';
import { TemplateFull } from 'store/abstract/TemplateService';
import { Observer } from 'mobx-react';
import TemplateEditor from 'components/template-editor/template-editor';
import { notUndefined } from 'utils/utils';

const log = InitLogger({ dirname: 'pages/streamer', filename: 'index.tsx' });
type TemplateVmType = ReturnType<typeof TemplateVM>;

interface Params {
  deviceId: IComputedValue<string>;
  isVisible: IComputedValue<boolean>;
  apiService: ApiServiceType;
  InitTemplateVM: (template: TemplateFull) => TemplateVmType;
}

export default function({ isVisible, apiService, deviceId, InitTemplateVM }: Params) {
  return pipe(
    State(
      {
        templates: [] as TemplateVmType[],
        playback: -1
      },
      { deep: false }
    ),

    Computed(() => ({
      isVisible: isVisible.get()
    })),

    Methods(({ state, setState, initialState }) => {
      let intervalId = null as null | NodeJS.Timeout;

      const play = (start: boolean) => {
        if (start) {
          setState({ playback: 0 });
          const miliSeconds = 2000;
          intervalId = setInterval(() => {
            const reachedEnd = state.get().playback === state.get().templates.length - 1;
            setState({ playback: reachedEnd ? 0 : state.get().playback + 1 });
          }, miliSeconds);
        } else {
          intervalId !== null && clearInterval(intervalId);
          setState({ playback: -1 });
        }
      };
      return {
        play,
        async getAll() {
          try {
            const response = await apiService.streamApi().getDeviceCampaigns(deviceId.get());
            const templates = response.data
              .flatMap(currCampaign => currCampaign.templates)
              .map(t => {
                const result = TemplateV.decode(t);
                if (Either.isRight(result)) {
                  return InitTemplateVM(result.right);
                } else {
                  return undefined;
                }
              })
              .filter(notUndefined);

            setState({ templates });

            play(true);
          } catch (error) {
            log.error('Failed to fetch device campaigns', error);
          }
        }
      };
    }),

    Run(({ state, methods, setState }) => {
      isVisible.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) {
          methods.getAll();
        }
        if (newValue === false) {
          methods.play(false);
        }
      }, true);
    }),

    View(({ state }) => (
      <>
        {state.get().templates.map((template, index) => (
          <Observer key={index}>
            {() => {
              const showCurrTemplate = index === state.get().playback;
              return (
                <div
                  className={classNames('fixed bb-transition-opacity', { 'bb-slide-down-slow': false })}
                  style={{ top: 0, bottom: 0, left: 0, right: 0, opacity: showCurrTemplate ? 1 : 0 }}>
                  <TemplateEditor {...template} computed={template.computed.get()} viewMode={true} />
                </div>
              );
            }}
          </Observer>
        ))}
      </>
    ))
  );
}
