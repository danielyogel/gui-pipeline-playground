import React from 'react';
import { Icon } from 'antd';
import { IComputedValue, computed } from 'mobx';
import { pipe, Either } from 'utils/fp';
import { View, Run, Methods, Computed, State } from 'utils/Init';
import { ModalServiceType } from 'store/abstract/modalVM';
import { Category, MediaAsset, Product, Visibility } from 'clientApi';
import { InitLogger } from 'utils/Logger';
import TemplatesHeader from './TemplatesHeader';
import TemplateVM from 'components/template-editor/template-editor-vm';
import { TemplateServiceType } from 'store/abstract/TemplateService';
import TemplateList from './TemplateList';
import { Header2 } from 'components/typography';
import TemplateEditor from 'components/template-editor/template-editor';
import { initInternals } from './Internals';

const log = InitLogger({ dirname: 'application/templates', filename: 'Templates.tsx' });

type Params = {
  currView: IComputedValue<'LIST' | number | null>;
  selectView: (id: number | null) => void;
  catagories: IComputedValue<Category[]>;
  templateService: TemplateServiceType;
  modalService: ModalServiceType;
  stickers: IComputedValue<MediaAsset[]>;
  backgrounds: IComputedValue<MediaAsset[]>;
  products: IComputedValue<Product[]>;
};

export default function({ currView, selectView, catagories, templateService, modalService, stickers, backgrounds, products }: Params) {
  return pipe(
    State(
      {
        useritems: [] as ReturnType<typeof TemplateVM>[],
        platformItemsByCategory: [] as Array<{ category: Category; templates: ReturnType<typeof TemplateVM>[] }>
      },
      { deep: false }
    ),
    Computed(({ state }) => ({
      currView: currView.get(),
      isVisible: currView.get() !== null,
      selectedTemplateVM: state.get().useritems.find(({ state: { id } }) => id === currView.get())
    })),
    Methods(({ state, setState }) => {
      const { _TemplateVM, _addTemplatesToCategory } = initInternals(templateService, modalService, () => selectView(null), stickers, backgrounds, products);

      return {
        add: async (categoryId: number) => {
          try {
            const template = await templateService.createTemplateIntoCategory();
            const templateVM = _TemplateVM(template);
            const useritemsUpdated = [templateVM, ...state.get().useritems];

            setState({ useritems: useritemsUpdated });
            selectView(templateVM.state.id);
          } catch (e) {
            log.error('Templates getAll Failure', e);
            modalService.error({ title: 'Template Creation Failure' });
          }
        },
        getAll: async () => {
          setState({ platformItemsByCategory: [], useritems: [] });
          try {
            const getAllPlatform = catagories.get().map(_addTemplatesToCategory);
            const getAllUser = templateService.getTemplatesPaged(undefined, 1, 10, Visibility.USER).then(res => res.map(_TemplateVM));
            const [platformItemsByCategory, useritems] = await Promise.all([Promise.all(getAllPlatform), getAllUser]);
            setState({ platformItemsByCategory, useritems });
          } catch (e) {
            log.error('Templates getAll Failure', e);
            modalService.error({ title: 'Templates fetch failure' });
          }
        },
        onImport: async (id: number) => {
          try {
            pipe(
              await templateService.importPlatformTemplate(id),
              Either.fold(
                () => {
                  modalService.error({ title: 'Import Failed' });
                },
                res => {
                  setState({ useritems: [_TemplateVM(res), ...state.get().useritems] });
                }
              )
            );
            modalService.success({ title: 'Import success' });
          } catch (e) {
            log.error('Templates onImport failure', e);
            modalService.error({ title: 'Import failed' });
          }
        },
        onDelete: async (id: number) => {
          templateService
            .deleteTemplate(id)
            .then(() => {
              setState({
                useritems: state.get().useritems.filter(i => i.state.id !== id),
                platformItemsByCategory: state.get().platformItemsByCategory.map(entity => {
                  const templates = entity.templates.filter(i => i.state.id !== id);
                  return { ...entity, templates };
                })
              });
              modalService.success({ title: 'Removed Successfully!' });
            })
            .catch(e => {
              log.error('Templates onDelete failure', e);
              modalService.error({ title: 'Delete Failure!' });
            });
        },
        onSelect: async (id: number) => {
          selectView(id);
        }
      };
    }),
    Run(({ methods }) => {
      computed(() => currView.get() && catagories.get().length).observe(({ newValue, oldValue }) => {
        if (newValue !== null) {
          if (newValue > 0 || oldValue === undefined) methods.getAll();
        }
      }, true);
    }),
    View(({ state, computed, methods }) => {
      const selectedTemplateVM = computed.get().selectedTemplateVM;
      return (
        <section className='h-full'>
          <TemplatesHeader />
          <section style={{ height: 'calc(100% - 3rem)' }} className='overflow-y-scroll p-6 bb-slide-up'>
            {selectedTemplateVM ? (
              <TemplateEditor {...selectedTemplateVM} computed={selectedTemplateVM.computed.get()} viewMode={false} />
            ) : (
              <>
                <section>
                  <Header2>User's Templates</Header2>
                  <TemplateList items={state.get().useritems} onSelect={methods.onSelect} onDelete={methods.onDelete}></TemplateList>
                </section>
                <section>
                  <Header2>Backoffice Templates</Header2>
                  {state.get().platformItemsByCategory.map(({ category, templates }) => (
                    <div key={category.id} className='cursor-pointer'>
                      <TemplateList title={category.name} items={templates} onSelect={methods.onImport}></TemplateList>
                      <div onClick={() => methods.add(category.id)} style={{ position: 'relative', top: '-26px' }}>
                        <Icon type='plus' className='align-middle ml-1' />
                        <span>
                          Add Template to <b>{category.name}</b> Category
                        </span>
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}
          </section>
        </section>
      );
    })
  );
}
