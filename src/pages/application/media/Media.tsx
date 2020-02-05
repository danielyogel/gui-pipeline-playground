import { IComputedValue } from 'mobx';
import React from 'react';
import { Choose } from 'react-extras';
import { pipe } from 'utils/fp';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import { AppSubHeader } from '../application-sub-header';
import { MediaAsset, MediaClassification, Visibility, MediaLicense } from 'clientApi';
import { mediaAttribution, _getTitle } from './media-utils';
import { MediaList } from './MediaList';
import { MediaForm } from './MediaForm';
import { InitLogger } from 'utils/Logger';
const log = InitLogger({ dirname: 'pages/application', filename: 'Media.tsx' });

type Params = {
  mode: IComputedValue<'PLATFORM' | 'USER' | null>;
  refresh: IComputedValue<boolean>;
  classification: MediaClassification;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
};

const PER_PAGE = 8;

export default function({ mode, refresh, classification, apiService, modalService }: Params) {
  return pipe(
    State({
      selectedView: 'LIST' as 'LIST' | 'FORM',
      platformItems: [] as MediaAsset[],
      useritems: [] as MediaAsset[],
      licenses: [] as MediaLicense[],
      formValue: { classification, mediaAttribution, file: null as Blob | null },
      page: 1,
      isLastPage: null as null | boolean,
      isLoading: false,
      loadError: null as null | Error
    }),
    Computed(({ state }) => ({
      mode: mode.get(),
      isVisible: mode.get() !== null,
      isUser: mode.get() === 'USER',
      classification,
      isValid:
        state.get().formValue.file !== null &&
        (mode.get() === 'USER' || state.get().formValue.mediaAttribution?.license?.id !== undefined)
    })),
    Methods(({ state, computed, setState, initialState }) => {
      const getAll = async function() {
        setState({ isLoading: true, loadError: null });
        try {
          const getPLatformMedia = apiService
            .mediaApi()
            .getMediaPaged(state.get().page, PER_PAGE, classification, Visibility.PLATFORM);
          const isLast = apiService
            .mediaApi()
            .getMediaPaged(state.get().page + 1, PER_PAGE, classification, Visibility.PLATFORM)
            .then(({ data }) => !data || data.length === 0);
          if (computed.get().isUser) {
            const getUserMedia = apiService.mediaApi().getMediaPaged(1, 1000, classification, Visibility.USER);
            const [platformResponse, userResponse, isLastResponse] = await Promise.all([getPLatformMedia, getUserMedia, isLast]);
            setState({
              platformItems: [...state.get().platformItems, ...platformResponse.data],
              useritems: [...state.get().useritems, ...userResponse.data],
              isLastPage: isLastResponse
            });
          } else {
            const [platformResponse, isLastResponse] = await Promise.all([getPLatformMedia, isLast]);

            setState({ platformItems: [...state.get().platformItems, ...platformResponse.data], isLastPage: isLastResponse });
          }
        } catch (loadError) {
          log.error('Failed to fetch ' + classification, loadError);
          modalService.error({ title: 'Failed to fetch ' + classification });
          setState({ loadError });
        } finally {
          setState({ isLoading: false });
        }
      };
      return {
        async getAllLicenses() {
          try {
            setState({ licenses: (await apiService.licensesApi().getLicenses())['data'] });
          } catch (error) {
            log.error('Failed to Fetch Licenses', error);
            modalService.error({ title: 'Failed to Fetch Licenses' });
          }
        },
        setView(selectedView: 'LIST' | 'FORM') {
          setState({ selectedView });
        },
        importMedia: async (id: number) => {
          if (computed.get().isUser) {
            const mediaToImport = state.get().platformItems.find(m => m.id === id);
            if (mediaToImport) {
              modalService.confirm({
                title: 'Please Approve Media Attribution',
                cancelText: 'Cancel',
                okText: 'Approve and Import',
                content: (
                  <section>
                    <section>
                      <span>Title: </span>
                      <b>{mediaToImport.attribution?.title || 'Unknown'}</b>
                    </section>
                    <section>
                      <span>Author: </span>
                      <b>{mediaToImport.attribution?.author || 'Unknown'}</b>
                    </section>
                    <section>
                      <span>Author URL: </span>
                      <b>{mediaToImport.attribution?.authorUrl || 'Unknown'}</b>
                    </section>
                    <section>
                      <span>License Name: </span>
                      <b>{mediaToImport.attribution?.license?.licenseName || 'Unknown'}</b>
                    </section>
                    <section>
                      <span>License Copyright: </span>
                      <b>{mediaToImport.attribution?.license?.copyright || 'Unknown'}</b>
                    </section>
                    <section>
                      <span>License URL: </span>
                      <b>{mediaToImport.attribution?.license?.licenseUrl || 'Unknown'}</b>
                    </section>
                    <section>
                      <span>Source: </span>
                      <b>{mediaToImport.attribution?.source || 'Unknown'}</b>
                    </section>
                    <section>
                      <span>Source URL: </span>
                      <b>{mediaToImport.attribution?.sourceUrl || 'Unknown'}</b>
                    </section>
                  </section>
                ),
                onOk: async () => {
                  try {
                    setState({
                      useritems: [(await apiService.mediaApi().importPlatformMedia(id)).data, ...state.get().useritems]
                    });
                    modalService.success({ title: 'Import success' });
                  } catch (getAllError) {
                    modalService.error({ title: 'Import failed' });
                  }
                }
              });
            }
          }
        },
        onDelete(id: number) {
          apiService
            .mediaApi()
            .deleteMediaFile(id)
            .then(() => {
              setState({
                useritems: state.get().useritems.filter(i => i.id !== id),
                platformItems: state.get().platformItems.filter(i => i.id !== id)
              });
              modalService.success({ title: 'Removed Successfully!' });
            })
            .catch(() => {
              modalService.error({ title: 'Failure!' });
            });
        },
        paginate() {
          if (state.get().isLoading) {
            return;
          }
          if (state.get().loadError) {
            getAll();
          }
          setState({ page: state.get().page + 1 });
        },
        onChange(changes: Partial<typeof initialState['formValue']>) {
          setState({ formValue: { ...state.get().formValue, ...changes } });
        },
        getAll,
        post(data: typeof initialState['formValue']) {
          const blob = data.file;
          if (!blob) {
            return;
          }
          const modal = modalService.info({
            title: 'Upload in Progress',
            okText: null,
            maskClosable: false,
            keyboard: false,
            okButtonProps: {
              loading: true
            }
          });
          apiService
            .mediaApi()
            .uploadFile(
              blob,
              data.classification,
              mode.get() === 'PLATFORM' ? (JSON.stringify(data.mediaAttribution) as any) : undefined
            )
            .then(({ data }) => {
              const updatedItems = {
                [computed.get().isUser ? 'useritems' : 'platformItems']: [
                  data,
                  ...(computed.get().isUser ? state.get().useritems : state.get().platformItems)
                ]
              };
              setState({
                selectedView: 'LIST',
                formValue: initialState.formValue,
                ...updatedItems
              });
              modal.update({
                type: 'success',
                title: 'Image Upload Success'
              });
            })
            .catch(error => {
              modal.update({
                type: 'error',
                title: 'Image Upload Failure'
              });
            })
            .finally(() => {
              modal.update({
                okText: 'OK',
                onOk: () => modal.destroy(),
                maskClosable: true,
                keyboard: true,
                okButtonProps: {
                  loading: false
                }
              });
            });
        }
      };
    }),
    Run(({ state, methods }) => {
      refresh.observe(({ newValue, oldValue }) => {
        if (newValue && newValue !== oldValue) {
          methods.getAll();
          if (mode.get() === 'PLATFORM') {
            methods.getAllLicenses();
          }
        }
      }, true);
      state.observe(({ newValue, oldValue }) => {
        if (oldValue && newValue.page !== oldValue.page) {
          methods.getAll();
        }
      });
    }),
    View(({ state, computed, methods }) => (
      <section className='h-full'>
        <AppSubHeader
          listName={_getTitle(classification)}
          createName='create'
          selectedView={state.get().selectedView === 'FORM' ? 'ITEM' : 'LIST'}
          setView={v => methods.setView(v === 'ITEM' ? 'FORM' : 'LIST')}
        />
        <section style={{ height: 'calc(100% - 3rem)' }} className='overflow-y-scroll p-6 bb-slide-up'>
          <Choose>
            <Choose.When condition={state.get().selectedView === 'FORM'}>
              <MediaForm
                formValue={state.get().formValue}
                onChange={methods.onChange}
                post={methods.post}
                licenses={state.get().licenses}
                isValid={computed.get().isValid}
                mode={mode}
              />
            </Choose.When>
            <Choose.Otherwise>
              <MediaList
                useritems={state.get().useritems}
                platformItems={state.get().platformItems}
                classification={classification}
                mode={computed.get().mode}
                importMedia={methods.importMedia}
                onDelete={methods.onDelete}
                isLast={state.get().isLastPage}
                onNext={methods.paginate.bind(null, 'NEXT')}
              />
            </Choose.Otherwise>
          </Choose>
        </section>
      </section>
    ))
  );
}
