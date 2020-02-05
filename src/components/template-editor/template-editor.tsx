import React from 'react';
import {} from 'antd';

import useFullScreen from 'utils/UseFullScreenHook';

import MainView from './template-editor__main';
import MainViewControls from './template-editor__main__controls';
import TopBar from './template-editor__top_bar';
import RightBar from './template-editor__right_bar';
import LeftBar from './template-editor__left_bar';

import { VmType } from './template-editor-vm';

export default function(params: VmType & { viewMode: boolean }) {
  const { isFullScreen, setIsFullScreen, ref: fullScreenRef } = useFullScreen();

  const selectedTextNodeRef = React.useRef(null);

  const effectiveViewMode = params.viewMode || isFullScreen;

  if (params.viewMode || isFullScreen) {
    return (
      <section ref={fullScreenRef} className='flex justify-center items-center h-full'>
        <MainView {...params} viewMode={effectiveViewMode} />
      </section>
    );
  }

  return (
    <section className='w-full h-full overflow-hidden bb-fade-in-slow'>
      <section className='h-12 border border-gray-400 z-0'>
        <TopBar {...params} onPreview={() => setIsFullScreen(true)} />
      </section>

      <section className='w-full flex items-stretch z-10' style={{ height: 'calc(100% - 3rem)' }}>
        <div className='w-48'>
          <LeftBar {...params} />
        </div>

        <div style={{ width: 'calc(100% - 24rem)' }} className='z-0'>
          <section className='h-12'>
            <MainViewControls {...params} selectedTextNodeRef={selectedTextNodeRef} />
          </section>
          <section style={{ height: 'calc(100% - 3rem)' }} className='p-6'>
            <section className='bb-shadow'>
              <MainView {...params} viewMode={effectiveViewMode} textElementRef={selectedTextNodeRef} />
            </section>
          </section>
        </div>

        <div className='w-48 bg-red-300 z-10'>
          <RightBar {...params} />
        </div>
      </section>
    </section>
  );
}
