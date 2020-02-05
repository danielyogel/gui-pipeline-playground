import React, { useState } from 'react';
import Input from 'antd/lib/input';

export function StringInputWithUnits<U extends string | null>(params: {
  title: string;
  units: U[];
  state: {
    value: string;
    unit: U;
  };
  onStateChange: (s: typeof state) => void;
}) {
  const { title, units, state, onStateChange } = params;

  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const TITLE_SECTION = <div className='bg-gray-700 h-full w-20 text-white align-middle flex items-center pl-2'>{title}</div>;

  const INPUT_SECTION = (
    <div className='bg-gray-200 h-full flex-grow pl-2 flex items-center'>
      <Input
        type='string'
        value={state.value}
        onChange={({ target: { value } }) => onStateChange({ ...state, value })}
        className='bg-transparent border-none outline-none shadow-none'
      />
    </div>
  );

  const DROPDOWN_SECTION =
    units && units.filter(u => u !== null).length ? (
      <div className='relative w-8 bg-gray-200 flex items-center justify-center' onClick={() => setIsDropDownOpen(!isDropdownOpen)}>
        <span className='absolute cursor-pointer w-full h-full text-center flex items-center'>{state.unit}</span>
        {isDropdownOpen && (
          <div className='absolute cursor-pointer w-full text-center bg-gray-200 z-10' style={{ top: '100%', left: '-10px', right: 0 }}>
            {units.map((currUnit, i) => (
              <div key={i} onClick={() => onStateChange({ ...state, unit: currUnit })}>
                {currUnit}
              </div>
            ))}
          </div>
        )}
      </div>
    ) : null;

  return (
    <section className='flex h-8 rounded-lg border mb-2 mt-3'>
      {TITLE_SECTION}
      {INPUT_SECTION}
      {DROPDOWN_SECTION}
    </section>
  );
}

export function NumberInputWithUnits<U extends string | null>(params: {
  title: string;
  units: U[];
  state: {
    value: number;
    unit: U;
  };
  onStateChange: (s: typeof state) => void;
}) {
  const { title, units, state, onStateChange } = params;

  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const TITLE_SECTION = <div className='bg-gray-700 h-full w-20 text-white align-middle flex items-center pl-2'>{title}</div>;

  const INPUT_SECTION = (
    <div className='bg-gray-200 h-full flex-grow pl-2 flex items-center'>
      <Input
        type='number'
        value={state.value}
        onChange={({ target: { value } }) => onStateChange({ ...state, value: Number(value) })}
        className='bg-transparent border-none outline-none shadow-none'
      />
    </div>
  );

  const DROPDOWN_SECTION =
    units && units.filter(u => u !== null).length ? (
      <div className='relative w-8 bg-gray-200 flex items-center justify-center' onClick={() => setIsDropDownOpen(!isDropdownOpen)}>
        <span className='absolute cursor-pointer w-full h-full text-center flex items-center'>{state.unit}</span>
        {isDropdownOpen && (
          <div className='absolute cursor-pointer w-full text-center bg-gray-200 z-10' style={{ top: '100%', left: '-10px', right: 0 }}>
            {units.map((currUnit, i) => (
              <div key={i} onClick={() => onStateChange({ ...state, unit: currUnit })}>
                {currUnit}
              </div>
            ))}
          </div>
        )}
      </div>
    ) : null;

  return (
    <section className='flex h-8 rounded-lg border mb-2 mt-3'>
      {TITLE_SECTION}
      {INPUT_SECTION}
      {DROPDOWN_SECTION}
    </section>
  );
}
