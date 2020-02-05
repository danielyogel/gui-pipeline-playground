import React, { useEffect } from 'react';
import { useLocalStore, useObserver } from 'mobx-react';
import { Rnd } from 'react-rnd';
import { useSize } from '@umijs/hooks';
import { classNames } from 'react-extras';

import { assertNever } from 'utils/utils';
import { NodeKind, Node } from 'schemas';
import { InitConvertors } from './utils/template-editor-utils';
import { VmType } from './template-editor-vm';
import RichTextEditor from './utils/template-editor__text_element';
import { Editor } from 'slate-react';

const NO_RND_CLASSNAME = 'BB_NO_RND';

export default function({
  viewMode,
  textElementRef,
  meta: { screenRatio: RATIO },
  state: { content: templateContent },
  computed: { nodesforDisplay },
  methods: { onNodeChange, selectNode }
}: VmType & { viewMode: boolean; textElementRef?: React.RefObject<Editor> }) {
  const localStore = useLocalStore(() => ({
    containerWidth: 0,
    containerHeight: 0,
    setContainerWidth(width: number) {
      this.containerWidth = width;
    },
    setContainerHeight(height: number) {
      this.containerHeight = height;
    }
  }));

  return useObserver(() => {
    const effectiveHeight = localStore.containerWidth / localStore.containerHeight === RATIO ? localStore.containerHeight : localStore.containerWidth / RATIO;

    const { toPercentage, toPixels } = InitConvertors(localStore.containerWidth, localStore.containerHeight);
    const onPositionChange = (node: Node, changes: Partial<Node>) => {
      selectNode(node.ID);
      onNodeChange(node, toPercentage(changes));
    };

    const SREEN_RATIO = localStore.containerHeight / 675;
    const DEFAULT_FONT_SIZE = `${16 * SREEN_RATIO}px`;

    const [size, ref] = useSize();
    useEffect(() => {
      size.width !== undefined && localStore.setContainerWidth(size.width);
      size.height !== undefined && localStore.setContainerHeight(size.height);
    }, [size]);

    return (
      <section style={{ pointerEvents: viewMode ? 'none' : 'auto', height: effectiveHeight }} className='w-full overflow-hidden'>
        <section
          ref={ref}
          style={{ backgroundColor: templateContent.bg_color, fontSize: DEFAULT_FONT_SIZE }}
          className='h-full border-black border-border-solid relative bg-white flex-grow relative'>
          {nodesforDisplay.map((node, index) => {
            const isNodeSelected = node.ID === templateContent.selectedNode;
            const zIndex = index + 1;
            const { width, height, x, y } = toPixels(node);

            if (node.KIND === NodeKind.IMAGE && node.entity === 'BACKGROUND') {
              return (
                <div key={node.ID} onClick={() => selectNode(node.ID)} className='h-full'>
                  <NodeView node={node} onNodeChange={onNodeChange} viewMode={viewMode} localStore={localStore} />;
                </div>
              );
            }

            return (
              <Rnd
                className={classNames('border-2 border-transparent', { 'border-blue-600': isNodeSelected && !viewMode })}
                key={node.ID}
                style={{ zIndex }}
                size={{ width, height }}
                position={{ x, y }}
                enableResizing={undefined}
                onDragStop={(e, d) => {
                  e.stopPropagation();
                  onPositionChange(node, { left: d.x, top: d.y });
                }}
                cancel={`.${NO_RND_CLASSNAME}`}
                lockAspectRatio={node.KIND === NodeKind.IMAGE || node.KIND === NodeKind.STATIC_IMAGE ? true : false}
                disableDragging={viewMode ? true : false}
                bounds='parent'
                onClick={() => selectNode(node.ID)}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  onPositionChange(node, { left: pos.x, top: pos.y, width: ref.clientWidth, height: ref.clientHeight })
                }>
                <NodeView
                  node={node}
                  onNodeChange={onNodeChange}
                  {...(textElementRef && isNodeSelected && { textElementRef })}
                  viewMode={viewMode}
                  localStore={localStore}
                />
              </Rnd>
            );
          })}
        </section>
      </section>
    );
  });
}

function NodeView({
  node,
  onNodeChange,
  textElementRef,
  viewMode,
  localStore
}: {
  node: Node;
  onNodeChange: VmType['methods']['onNodeChange'];
  textElementRef?: React.RefObject<Editor>;
  viewMode: boolean;
  localStore: { containerHeight: number };
}) {
  return node.KIND === NodeKind.IMAGE || node.KIND === NodeKind.STATIC_IMAGE ? (
    node.content ? (
      <img src={node.content} alt='Red dot' className='w-full h-full block' draggable={false} />
    ) : null
  ) : node.KIND === NodeKind.TEXT ? (
    <div className={`p-1 cursor-text ${NO_RND_CLASSNAME}`}>
      <RichTextEditor
        {...(textElementRef && { forwardRef: textElementRef })}
        value={node.content}
        onChange={content => onNodeChange(node, { content })}
        localStore={localStore}
        viewMode={viewMode}></RichTextEditor>
    </div>
  ) : node.KIND === NodeKind.CIRCLE || node.KIND === NodeKind.RECTANGLE || node.KIND === NodeKind.TRIANGLE ? (
    <svg
      viewBox='0 0 100 100'
      preserveAspectRatio='none'
      className='block w-full h-full'
      stroke={node.stroke}
      strokeWidth={node['stroke-width']}
      strokeDasharray={node['stroke-dasharray']}>
      {node.KIND === NodeKind.CIRCLE ? (
        <circle cx='50%' cy='50%' r='50%' fill={node.fill} />
      ) : node.KIND === NodeKind.RECTANGLE ? (
        <rect x='0' y='0' width='100' height='100' fill={node.fill} />
      ) : node.KIND === NodeKind.TRIANGLE ? (
        <polygon points='50,0 100,100 0,100' fill={node.fill} />
      ) : (
        assertNever(node)
      )}
    </svg>
  ) : (
    assertNever(node)
  );
}
