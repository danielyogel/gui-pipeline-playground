import React from 'react';
import { Icon, Dropdown, Menu } from 'antd';
import { chain, map, getOrElse } from 'fp-ts/es6/Option';
import { pipe } from 'fp-ts/es6/pipeable';
import { findIndex, lookup } from 'fp-ts/es6/Array';
import { classNames } from 'react-extras';
import { CompactPicker } from 'react-color';
import { Editor, Mark } from 'slate';

import { NodeKind, Node, SvgNodeV } from 'schemas';
import { VmType } from './template-editor-vm';

import { NodeViewer } from './utils/template-editor-utils';
import { FONT_SIZES } from './utils/template-editor__text_sizes';
import { COLORS_ARRAY } from './utils/template-editor-colors';

import { assertNever } from 'utils/utils';

type Params = VmType & {
  selectedTextNodeRef: React.RefObject<Editor>;
};

export default function({ state: { content }, methods: { onDuplicate, onDepth, onDelete, onNodeChange }, selectedTextNodeRef }: Params) {
  const { nodes, selectedNode } = content;

  return pipe(
    nodes,
    findIndex(n => n.ID === selectedNode),
    chain(nodeIndex =>
      pipe(
        lookup(nodeIndex, nodes),
        map(node => {
          const isMovable = !(node.KIND === NodeKind.IMAGE && node.entity === 'BACKGROUND');
          return (
            <section className='bg-gray-200 h-full'>
              <section className='flex h-full'>
                <NodeIcon node={node}></NodeIcon>

                <DuplicateNodeSection isVisible={isMovable} node={node} onDuplicate={onDuplicate}></DuplicateNodeSection>

                <DeleteNodeSection nodeIndex={nodeIndex} onDelete={onDelete}></DeleteNodeSection>

                <DepthSection isVisible={isMovable} currIndex={nodeIndex} onDepth={onDepth}></DepthSection>

                <SvgControls node={node} onNodeChange={onNodeChange}></SvgControls>

                <TextSpecificControls node={node} selectedTextNodeRef={selectedTextNodeRef} />

                <ColorsBar node={node} onNodeChange={onNodeChange} selectedTextNodeRef={selectedTextNodeRef} />
              </section>
            </section>
          );
        })
      )
    ),
    getOrElse(() => {
      return <section className='bg-gray-200 h-full' />;
    })
  );
}

//
// Internals
//

function NodeIcon({ node }: { node: Node }) {
  return (
    <BarItem className='bb-background-gardient-one flex items-center justify-center'>
      <NodeViewer nodeKind={node.KIND} style={{ width: '50%', height: '50%', fontSize: '1.4rem' }} />
    </BarItem>
  );
}

function DuplicateNodeSection({ node, onDuplicate, isVisible }: { node: Node; onDuplicate: VmType['methods']['onDuplicate']; isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <BarItem onClick={() => onDuplicate(node)}>
      <BarIcon type='copy' theme='twoTone' />
    </BarItem>
  );
}

function DeleteNodeSection({ nodeIndex, onDelete }: { nodeIndex: number; onDelete: VmType['methods']['onDelete'] }) {
  return (
    <BarItem onClick={() => onDelete(nodeIndex)}>
      <BarIcon type='delete' theme='twoTone' twoToneColor='red' />
    </BarItem>
  );
}

function DepthSection({ currIndex, onDepth, isVisible }: { currIndex: number; onDepth: VmType['methods']['onDepth']; isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <>
      <BarItem onClick={() => onDepth(currIndex, 'UP')}>
        <Icon type='up' />
      </BarItem>
      <BarItem onClick={() => onDepth(currIndex, 'DOWN')}>
        <Icon type='down' />
      </BarItem>
    </>
  );
}

function SvgControls({ node, onNodeChange }: { node: Node; onNodeChange: VmType['methods']['onNodeChange'] }) {
  if (!SvgNodeV.is(node)) {
    return null;
  }
  const STROKE_WIDTH_OPTIONS = (
    <Menu>
      {['0px', '2px', '6px', '12px'].map(currStrokeWidth => (
        <Menu.Item key={currStrokeWidth} onClick={() => onNodeChange(node, { 'stroke-width': currStrokeWidth })}>
          {currStrokeWidth === '0px' ? (
            <span className='text-sm'>none</span>
          ) : (
            <svg viewBox='0 0 100 100' className='w-6' xmlns='http://www.w3.org/2000/svg'>
              <line x1='0' y1='50' x2='100' y2='50' stroke='black' strokeWidth={currStrokeWidth} />
            </svg>
          )}
        </Menu.Item>
      ))}
    </Menu>
  );

  const STROKE_DASHED_OPTIONS = (
    <Menu>
      {['0px', '2px', '6px', '12px'].map(currStrokeDashArray => (
        <Menu.Item key={currStrokeDashArray} onClick={() => onNodeChange(node, { 'stroke-dasharray': currStrokeDashArray })}>
          {currStrokeDashArray === '0px' ? (
            <span className='text-sm'>none</span>
          ) : (
            <svg viewBox='0 0 100 100' className='w-8' xmlns='http://www.w3.org/2000/svg'>
              <line x1='0' y1='50' x2='100' y2='50' stroke='black' strokeDasharray={currStrokeDashArray} strokeWidth='12px' />
            </svg>
          )}
        </Menu.Item>
      ))}
    </Menu>
  );

  const STROKE_COLOR_OPTIONS = <CompactPicker onChangeComplete={c => onNodeChange(node, { stroke: c.hex })} color={node.stroke}></CompactPicker>;

  return (
    <>
      <Dropdown overlay={STROKE_WIDTH_OPTIONS} placement='bottomCenter'>
        <BarItem>
          <BarIcon className='text-black' type='line' />
        </BarItem>
      </Dropdown>
      <Dropdown overlay={STROKE_DASHED_OPTIONS} placement='bottomCenter'>
        <BarItem>
          <BarIcon className='text-black' type='dash' />
        </BarItem>
      </Dropdown>
      <Dropdown overlay={STROKE_COLOR_OPTIONS} placement='bottomCenter'>
        <BarItem>
          <BarIcon className='text-black' type='bg-colors' />
        </BarItem>
      </Dropdown>
    </>
  );
}

function TextSpecificControls({ node, selectedTextNodeRef }: { node: Node; selectedTextNodeRef: React.RefObject<Editor> }) {
  if (node.KIND !== NodeKind.TEXT) {
    return null;
  }

  const slateElement = selectedTextNodeRef.current;

  if (!slateElement) {
    return null;
  }

  const isBold = slateElement.value.marks.contains(Mark.create('bold'));
  const isItalic = slateElement.value.marks.contains(Mark.create('italic'));
  const isUnderLine = slateElement.value.marks.contains(Mark.create('underlined'));

  const FONT_FAMILIES = ['serif', 'sans-serif', 'monospace', 'fantasy', 'Verdana', 'cursive', 'Courier', 'Helvetica'];

  const currentFontFamilyMark = slateElement.value.marks.find(m => !!(m && m.type === 'fontFamily'));

  const currentfontFamilly = currentFontFamilyMark ? currentFontFamilyMark.data.get('value') : 'Ariel';

  return (
    <>
      <BarItem>
        <BarIcon
          className='text-black'
          type='bold'
          onClick={() => {
            slateElement.toggleMark('bold');
            slateElement.focus();
          }}
          style={{ opacity: isBold ? 1 : 0.7 }}
        />
      </BarItem>
      <BarItem>
        <BarIcon
          className='text-black'
          type='italic'
          onClick={() => {
            slateElement.toggleMark('italic');
            slateElement.focus();
          }}
          style={{ opacity: isItalic ? 1 : 0.7 }}
        />
      </BarItem>
      <BarItem>
        <BarIcon
          className='text-black'
          type='underline'
          onClick={() => {
            slateElement.toggleMark('underlined');
            slateElement.focus();
          }}
          style={{ opacity: isUnderLine ? 1 : 0.7 }}
        />
      </BarItem>
      <Dropdown
        overlay={
          <Menu>
            {Object.keys(FONT_SIZES).map(currSize => {
              const currSizeString = currSize.toString();

              return (
                <Menu.Item
                  key={currSize}
                  onClick={() => {
                    Object.keys(FONT_SIZES).forEach(FONT_SIZE => {
                      if (FONT_SIZE.toString() !== currSizeString) slateElement.removeMark(FONT_SIZE.toString());
                    });
                    slateElement.addMark(currSizeString);
                    slateElement.focus();
                  }}>
                  <span className={classNames({ 'font-bold': slateElement.value.marks.contains(Mark.create(currSizeString)) })}>{currSizeString + 'px'}</span>
                </Menu.Item>
              );
            })}
          </Menu>
        }
        placement='bottomCenter'>
        <BarItem>
          <BarIcon className='text-black' type='font-size' />
        </BarItem>
      </Dropdown>

      <Dropdown
        overlay={
          <Menu>
            {FONT_FAMILIES.map(CURR_MARK => (
              <Menu.Item
                key={CURR_MARK}
                onClick={() => {
                  const slateElement = selectedTextNodeRef.current;
                  if (slateElement) {
                    FONT_FAMILIES.forEach(value => slateElement.removeMark({ type: 'fontFamily', data: { value } }));
                    slateElement.addMark({ type: 'fontFamily', data: { value: CURR_MARK } });
                    slateElement.focus();
                  }
                }}>
                <span className={classNames('capitalize', { 'font-bold': currentfontFamilly === CURR_MARK })}>{CURR_MARK}</span>
              </Menu.Item>
            ))}
          </Menu>
        }
        placement='bottomCenter'>
        <BarItem className='w-20 capitalize'>{currentfontFamilly}</BarItem>
      </Dropdown>
    </>
  );
}

function ColorsBar({
  node,
  onNodeChange,
  selectedTextNodeRef
}: {
  node: Node;
  onNodeChange: VmType['methods']['onNodeChange'];
  selectedTextNodeRef: React.RefObject<Editor>;
}) {
  if (node.KIND === NodeKind.IMAGE || node.KIND === NodeKind.STATIC_IMAGE) {
    return null;
  }

  return (
    <section className='h-12 flex flex-no-wrap w-full overflow-x-scroll whitespace-no-wrap items-center'>
      {COLORS_ARRAY.map((selectedcolor, index) => (
        <div
          key={index}
          onClick={() => {
            switch (node.KIND) {
              case NodeKind.TEXT:
                const slateElement = selectedTextNodeRef.current;
                if (!slateElement) {
                  return;
                }
                COLORS_ARRAY.forEach(c => slateElement.removeMark({ type: 'color', data: { value: c } }));
                slateElement.addMark({ type: 'color', data: { value: selectedcolor } });
                slateElement.focus();
                return;
              case NodeKind.RECTANGLE:
              case NodeKind.TRIANGLE:
              case NodeKind.CIRCLE:
                return onNodeChange(node, { fill: selectedcolor });
              default:
                return assertNever(node);
            }
          }}
          className='cursor-pointer h-6 w-6 m-1 border rounded flex-shrink-0'
          style={{ backgroundColor: selectedcolor }}
        />
      ))}
    </section>
  );
}

function BarItem(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, children, ...rest } = props;
  return (
    <div {...rest} className={className + ' h-12 w-12 mr-1 flex items-center flex-shrink-0 justify-center cursor-pointer'}>
      {children}
    </div>
  );
}

function BarIcon({ style, ...rest }: React.ComponentProps<typeof Icon>) {
  return <Icon {...rest} style={{ ...style, fontSize: '18px' }} />;
}
