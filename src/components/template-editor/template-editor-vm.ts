import { autorun, IComputedValue } from 'mobx';
import { pipe } from 'fp-ts/es6/pipeable';
import { constant } from 'fp-ts/es6/function';
import { isRight } from 'fp-ts/es6/Either';
import { map, isSome, chain } from 'fp-ts/es6/Option';
import { findIndex, head, unsafeDeleteAt, modifyAt } from 'fp-ts/es6/Array';
import * as t from 'io-ts';

import { generateId, GetVmType, strEnum } from 'utils/utils';
import { Init } from 'utils/Init';
import { deepEqual, arraymove } from 'utils/fp';
import { ModalServiceType } from 'store/abstract/modalVM';
import { TemplateServiceType } from 'store/abstract/TemplateService';
import { NodeKind, Node, TemplateV } from 'schemas';
import { initNodeGenerators } from './utils/template-editor-utils';
import { MediaAsset, EntityStatus, Product } from 'clientApi';

type Params = {
  template: t.TypeOf<typeof TemplateV>;

  addTemplate?: () => void;
  onFinish?: () => void;

  products: IComputedValue<Product[]>;
  stickers: IComputedValue<MediaAsset[]>;
  backgrounds: IComputedValue<MediaAsset[]>;

  templateService: TemplateServiceType;
  modalService: ModalServiceType;
};

const META = { screenRatio: 16 / 9, templateStatus: strEnum([EntityStatus.PUBLISH, EntityStatus.DRAFT, EntityStatus.ARCHIVE]) };
const nodeGenerator = initNodeGenerators(META.screenRatio);
const isNodeUnMoveable = (node: Node) => node.KIND === NodeKind.IMAGE && node.entity === 'BACKGROUND';

export default function CreateTemplateVM({ template, onFinish, addTemplate, templateService, modalService, stickers, backgrounds, products }: Params) {
  return Init()
    .meta(META)
    .model(constant(template))
    .views(({ state }) => ({
      nodesforDisplay: state.content.nodes.map(n => {
        const mediaMeta = state.content.metadata && state.content.metadata.media;
        if (n.KIND !== NodeKind.IMAGE || !n.refRes || !mediaMeta) return n;
        const mediaMetaItem = mediaMeta[Number(n.refRes && n.refRes.id)];
        return mediaMetaItem ? { ...n, content: mediaMetaItem.url } : n;
      }),
      stickersForDisplay: stickers.get(),
      backgroundsForDisplay: backgrounds.get(),
      productsForDisplay: products.get()
    }))
    .actions(({ state, setState, mergeState }) => ({
      onFinish,
      addTemplate,
      onDelete(index: number) {
        mergeState({ content: { nodes: unsafeDeleteAt(index, state.content.nodes) } });
      },
      selectNode(selectedNode: null | string) {
        mergeState({ content: { selectedNode } });
      },
      onDuplicate(node: Node) {
        if (isNodeUnMoveable(node)) {
          return;
        }
        const dupNode = { ...node, ID: generateId(), top: node.top + 0.01 };
        mergeState({ content: { nodes: [...state.content.nodes, dupNode] } });
      },
      onDepth(index: number, direction: 'UP' | 'DOWN') {
        if (isNodeUnMoveable(state.content.nodes[index])) {
          return;
        }
        const l = state.content.nodes.length;
        const first = head(state.content.nodes);
        if (isSome(first)) {
          const { value: firstNode } = first;
          const lastNodeIsBackground = firstNode && firstNode.KIND === NodeKind.IMAGE && firstNode.entity === 'BACKGROUND';
          if (direction === 'UP' && l === index + 1) return;
          if (direction === 'DOWN' && (index === 0 || (index === 1 && lastNodeIsBackground))) return;
          mergeState({
            content: {
              nodes: arraymove(state.content.nodes, index, direction === 'UP' ? index + 1 : index - 1)
            }
          });
        }
      },
      changeTemplateStatus(status: EntityStatus) {
        templateService
          .updateTemplate({ ...state, status })
          .then(() => {
            setState({ status });
          })
          .catch(error => {
            modalService.error({ title: 'Failure' });
          });
      },
      onNodeChange<T extends Node>(node: T, changes: Partial<Omit<T, 'id'>>) {
        if (!isNodeUnMoveable(node)) {
          pipe(
            state.content.nodes,
            findIndex(n => n.ID === node.ID),
            chain(index => modifyAt<Node>(index, n => ({ ...n, ...changes }))(state.content.nodes)), // using 'modifyAt' to get fresh node state - GUI sends an old one
            map(nodes => mergeState({ content: { nodes } }))
          );
        }
      },
      onAdd(nodeKind: 'TRIANGLE' | 'CIRCLE' | 'RECTANGLE' | 'TEXT') {
        const newNode = nodeGenerator[nodeKind]();
        mergeState({
          content: {
            nodes: [...state.content.nodes, newNode],
            selectedNode: newNode.ID
          }
        });
      },
      onAddImage(media: MediaAsset, entity: 'PRODUCT_IMAGE' | 'STICKER') {
        const newNode = nodeGenerator.IMAGE(media, entity);
        mergeState({
          content: {
            nodes: [...state.content.nodes, newNode],
            selectedNode: newNode.ID
          }
        });
      },
      onAddLogo() {
        const newNode = nodeGenerator.STATIC_IMAGE('BUILDBOARD_LOGO');
        mergeState({
          content: {
            nodes: [...state.content.nodes, newNode],
            selectedNode: newNode.ID
          }
        });
      },
      addBackground(selectedBackground: MediaAsset | string) {
        const [firstNode, ...rest] = state.content.nodes;
        const firstNodeIsBackgroundImage = firstNode && firstNode.KIND === NodeKind.IMAGE && firstNode.entity === 'BACKGROUND';
        const selectedNodeIdIsBg = firstNodeIsBackgroundImage && firstNode.ID === state.content.selectedNode;
        if (typeof selectedBackground === 'string') {
          mergeState({
            content: {
              bg_color: selectedBackground,
              nodes: firstNodeIsBackgroundImage ? [...rest] : state.content.nodes,
              selectedNode: selectedNodeIdIsBg ? null : state.content.selectedNode
            }
          });
        } else {
          const newNode = nodeGenerator.IMAGE(selectedBackground, 'BACKGROUND');
          mergeState({
            content: {
              bg_color: 'white',
              nodes: firstNodeIsBackgroundImage ? [newNode, ...rest] : [newNode, ...state.content.nodes],
              selectedNode: newNode.ID
            }
          });
        }
      }
    }))
    .init(({ state, mergeState }) => {
      let lastSyncedContent = TemplateV.encode(state);
      autorun(
        () => {
          const serializedContent = TemplateV.encode(state);
          if (!deepEqual(serializedContent, lastSyncedContent)) {
            templateService
              .updateTemplate(state)

              .then(res => {
                lastSyncedContent = serializedContent;

                if (isRight(res)) {
                  const metadata = res.right.content.metadata;

                  if (!deepEqual(metadata, state.content.metadata)) {
                    mergeState({
                      content: {
                        metadata
                      }
                    });
                  }
                } else {
                  console.warn('IOTS VALIDATION FAILURE !');
                }
              })
              .catch(() => {
                modalService.error({ title: 'Failure while trying to sync template' });
              });
          }
        },
        { delay: 800 }
      );
    });
}

export type VmType = GetVmType<typeof CreateTemplateVM>;
