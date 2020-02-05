import React, { FC } from 'react';
import { If } from 'react-extras';
import ItemsList from 'components/ItemsList/ItemsList';
import MediaVM from './Media';
import { _getTitle } from './media-utils';
import { GetVmTypeFull } from 'utils/utils';
type VM = GetVmTypeFull<typeof MediaVM>;

type Type = FC<{
  useritems: VM['state']['useritems'];
  platformItems: VM['state']['platformItems'];
  mode: VM['computed']['mode'];
  classification: VM['computed']['classification'];
  importMedia: VM['methods']['importMedia'];
  onDelete: VM['methods']['onDelete'];
  isLast: boolean | null;
  onNext: () => void;
}>;

export const MediaList: Type = params => {
  const { useritems, platformItems, mode, classification, onDelete, importMedia, onNext, isLast } = params;
  return (
    <section className='h-full'>
      <If condition={mode === 'USER'}>
        <section className='mb-12 pb-12 border-b-2'>
          <ItemsList
            isLast={true}
            onNext={onNext}
            items={useritems.map(({ id, name, urlMinimized }) => ({ name, id, url: urlMinimized }))}
            onDelete={onDelete}
            title={`User ${_getTitle(classification)}`}
          />
        </section>
      </If>
      <ItemsList
        isLast={isLast}
        onNext={onNext}
        items={platformItems.map(({ id, name, urlMinimized }) => ({ name, id, url: urlMinimized }))}
        onDelete={mode === 'PLATFORM' ? onDelete : undefined}
        onSelect={importMedia}
        title={`Platform ${_getTitle(classification)}`}
      />
    </section>
  );
};
