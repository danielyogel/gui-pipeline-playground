import React from 'react';
import { IComputedValue } from 'mobx';
import { Icon } from 'antd';
import { pipe } from 'utils/fp';
import { generateRandomColor } from 'utils/utils';
import { View, Computed } from 'utils/Init';
import CampaignItem from './CampaignItem/CampaignItem';

type ItemVM = ReturnType<typeof CampaignItem>;

interface Params {
  isVisible: IComputedValue<boolean>;
  campaigns: IComputedValue<ItemVM[]>;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function({ onSelect, onDelete, isVisible, campaigns }: Params) {
  return pipe(
    {},
    Computed(() => ({
      isVisible: isVisible.get()
    })),

    View(() => (
      <section className='flex flex-wrap'>
        {campaigns.get().map(({ state }) => {
          const { campaign } = state.get();

          const CAMPAIGN_ID = `Campaign ${campaign.id}`;
          const CAMPAIGN_NAME_SHORT = campaign.name.slice(0, 6);
          return (
            <div
              className='m-2 p-2 w-48 h-48 cursor-pointer relative group'
              onClick={() => onSelect(campaign.id)}
              key={state.get().campaign.id}
              style={{ backgroundColor: generateRandomColor() }}>
              <section className='truncate font-bold'>{CAMPAIGN_NAME_SHORT}</section>
              <section>{CAMPAIGN_ID}</section>
              <Icon
                onClick={e => {
                  e.stopPropagation();
                  onDelete(campaign.id);
                }}
                type='delete'
                theme='filled'
                title='Remvoe'
                className='absolute color-red pointer text-bb-light-purple opacity-0 group-hover:opacity-100 bb-transition-all z-10 text-xl'
                style={{ top: '10px', right: '10px' }}
              />
            </div>
          );
        })}
      </section>
    ))
  );
}
