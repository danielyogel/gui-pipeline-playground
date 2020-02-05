import React from 'react';
import { classNames } from 'react-extras';
import {} from 'antd';

export default function<V extends string, O extends Array<V>>({
  value,
  options,
  onSelect,
  renderOption
}: {
  value: V;
  options: O;
  onSelect: (v: V) => void;
  renderOption?: (option: V, isSelected: boolean) => React.ReactNode | string;
}) {
  const RENDERED_OPTIONS = options.map(currValue => {
    const isSelected = currValue === value;
    const onValueSelection = () => onSelect(currValue);

    const CURR_VALUE_ELEMENT = renderOption ? renderOption(currValue, isSelected) : currValue;

    return (
      <div
        key={currValue}
        onClick={onValueSelection}
        className={classNames('px-2 cursor-pointer bb-transition-all', {
          'bg-bb-dark-purple': isSelected,
          'text-white': isSelected
        })}>
        <span className={classNames('capitalize bb-transition-all', { 'hover:text-bb-light-purple': !isSelected })}>{CURR_VALUE_ELEMENT}</span>
      </div>
    );
  });

  return <section className='rounded overflow-hidden border-2 border-bb-dark-purple flex justify-center items-center'>{RENDERED_OPTIONS}</section>;
}
