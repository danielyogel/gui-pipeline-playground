import React from 'react';

import { generateId } from 'utils/utils';

type params = {
  children: React.ReactNode;
  onFile: (file: Blob) => void;
} & React.HTMLAttributes<HTMLLabelElement>;

export function HiddenFileInput({ children, onFile, className }: params) {
  const id = generateId();
  const classNameToUSe = className ? `block ${className}` : 'block';
  return (
    <label htmlFor={id} className={classNameToUSe}>
      {children}
      <input id={id} type='file' className='hidden' onChange={e => e.target.files && e.target.files.length && onFile(e.target.files[0])} />
    </label>
  );
}
