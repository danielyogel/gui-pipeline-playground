import React, { useState } from 'react';
import { Icon } from 'antd';
import { classNames } from 'react-extras';

import { VmType } from './template-editor-vm';
import { NodeKind } from 'schemas';

export default function({ state: { content: templateContent }, methods: { selectNode } }: VmType) {
  const [currentTab, selectTab] = useState('LAYERS' as 'THEME' | 'LAYERS');

  const isThemeState = currentTab === 'THEME';

  const HEADER = (
    <section className='flex w-full items-center justify-center h-12'>
      <LeftBarButton isSelected={isThemeState} icon='pie-chart' text='Theme' onClick={() => selectTab('THEME')} />
      <LeftBarButton isSelected={!isThemeState} icon='database' text='Layers' onClick={() => selectTab('LAYERS')} />
    </section>
  );

  const THEMES_VIEW = <section className='pt-5'>Themes</section>;

  const LAYERS_VIEW = (
    <section className='overflow-y-scroll pt-4 pb-12' style={{ height: 'calc(100% - 3rem' }}>
      {templateContent.nodes
        .slice() // slice is called just in order to not mutate the original array
        .reverse()
        .map(node => (
          <div
            onClick={() => selectNode(node.ID)}
            key={node.ID}
            className={classNames('border-2 h-20 w-4/5 m-2 flex items-center justify-center cursor-pointer mx-auto', {
              'bg-blue-400': templateContent.selectedNode === node.ID
            })}>
            <span className='capitalize'>
              {node.KIND === NodeKind.IMAGE && node.entity === 'BACKGROUND'
                ? 'Background'
                : node.KIND === NodeKind.STATIC_IMAGE
                ? 'Logo'
                : node.KIND.toLowerCase()}
            </span>
          </div>
        ))}
    </section>
  );

  return (
    <section className='h-full bg-gray-200'>
      {HEADER}
      {isThemeState ? THEMES_VIEW : LAYERS_VIEW}
    </section>
  );
}

//
//  INTERNALS
//

function LeftBarButton({ text, icon, isSelected, onClick }: { text: string; icon: string; isSelected: boolean; onClick: () => void }) {
  return (
    <section
      onClick={onClick}
      className={classNames('cursor-pointer w-1/2 h-full flex justify-center items-center', { 'bg-white': !isSelected, border: !isSelected })}>
      <Icon type={icon} />
      <div className='ml-2'>{text}</div>
    </section>
  );
}
