import React from 'react';
import { Button } from 'antd';
import { State, Computed, Methods, View, Run } from 'utils/vm-generator';
import { pipe } from 'utils/fp';
import { IComputedValue } from 'mobx';

type Params = { isVisible: IComputedValue<boolean> };

// 1. Children
// 2. Context (dumb object VS import VS Haskell/GraphQL inspired context)
// 3. GraphQL
// 4. Pipe VS Flow

export default function({ isVisible }: Params) {
  return pipe(
    State({
      count: 0
    }),
    Computed(({ state }) => {
      const hasFinished = state.get().count > 10;
      const isDisabled = hasFinished === true;
      return { isVisible: isVisible.get(), hasFinished, isDisabled };
    }),
    Methods(({ state, setState, clear, computed }) => {
      return {
        onChange(direction: 'MINUS' | 'PLUS') {
          if (computed.get().isDisabled) {
            return;
          }
          setState({ count: direction === 'MINUS' ? state.get().count - 1 : state.get().count + 1 });
        },
        reset() {
          clear();
          alert('Reset Called');
        }
      };
    }),
    Run(({ state }) => {
      state.observe(({ newValue, oldValue }) => {
        if (newValue.count > 10) {
          alert('ENDED');
        }
        if (newValue.count === -1 && oldValue?.count === 0) {
          alert('Passed Zero !');
        }
      });
    }),
    View(({ state, computed, methods }) => {
      return (
        <section className='p-8 bg-blue-900 h-full'>
          <section className='text-4xl mb-6'>
            Current counter value: <b>{state.get().count}</b>
          </section>
          <section className='flex'>
            <div
              onClick={() => methods.onChange('MINUS')}
              className='w-12 h-12 mr-3 bg-red-500 text-2xl flex items-center justify-center cursor-pointer'>
              -
            </div>
            <div
              onClick={() => methods.onChange('PLUS')}
              className='w-12 h-12 mr-3 bg-green-600 text-2xl flex items-center justify-center cursor-pointer'>
              +
            </div>
            {computed.get().hasFinished && (
              <b className='text-6xl text-purple-600'>You've WON! Very NICE clicks, give a call to Kachlon ;) </b>
            )}
          </section>
          <section className='mt-6'>
            <Button onClick={methods.reset}>Reset</Button>
          </section>
        </section>
      );
    })
  );
}
