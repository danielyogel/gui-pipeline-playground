import React, { RefObject } from 'react';
import { Editor as SlateEditor } from 'slate-react';
import { Value } from 'slate';
import { Observer } from 'mobx-react';
import { isKeyHotkey } from 'is-hotkey';

import { FONT_SIZES } from './template-editor__text_sizes';

const isBoldHotkey = isKeyHotkey('mod+b');
const isItalicHotkey = isKeyHotkey('mod+i');
const isUnderlinedHotkey = isKeyHotkey('mod+u');
const isCodeHotkey = isKeyHotkey('mod+`');

type Params = {
  value: Value;
  onChange: (value: Value) => void;
  forwardRef?: RefObject<SlateEditor>;
  viewMode: boolean;
  localStore: { containerHeight: number };
};

export default React.memo(
  function RenderText({ value, onChange, forwardRef, viewMode, localStore }: Params) {
    return (
      <SlateEditor
        {...(forwardRef && { ref: forwardRef })}
        spellCheck
        readOnly={false}
        placeholder='Enter some text...'
        value={value}
        onChange={({ value }: { value: Value }) => onChange(value)}
        onKeyDown={(event, editor, next) => {
          let mark;

          if (isBoldHotkey(event as any)) {
            mark = 'bold';
          } else if (isItalicHotkey(event as any)) {
            mark = 'italic';
          } else if (isUnderlinedHotkey(event as any)) {
            mark = 'underlined';
          } else if (isCodeHotkey(event as any)) {
            mark = 'code';
          } else {
            return next();
          }

          event.preventDefault();
          editor.toggleMark(mark);
        }}
        renderBlock={(props, editor, next) => {
          const { attributes, children, node } = props;

          switch (node.type) {
            case 'block-quote':
              return <blockquote {...attributes}>{children}</blockquote>;
            case 'bulleted-list':
              return <ul {...attributes}>{children}</ul>;
            case 'heading-one':
              return <h1 {...attributes}>{children}</h1>;
            case 'heading-two':
              return <h2 {...attributes}>{children}</h2>;
            case 'list-item':
              return <li {...attributes}>{children}</li>;
            case 'numbered-list':
              return <ol {...attributes}>{children}</ol>;
            default:
              return next();
          }
        }}
        renderMark={(props, editor, next) => (
          <Observer>
            {() => {
              const { children, mark, attributes } = props;

              const fontSizeMatch = Object.entries(FONT_SIZES).find(([currSize, oldName]) => currSize === mark.type || oldName === mark.type);

              if (fontSizeMatch) {
                const SREEN_RATIO = localStore.containerHeight / 589;
                const fontSize = `${Number(fontSizeMatch[0]) * SREEN_RATIO}px`;
                return (
                  <span {...attributes} style={{ ...attributes.style, fontSize }}>
                    {children}
                  </span>
                );
              }

              switch (mark.type) {
                case 'fontFamily':
                  return (
                    <span {...attributes} style={{ fontFamily: mark.data.get('value') }}>
                      {children}
                    </span>
                  );
                case 'color':
                  return (
                    <span {...attributes} style={{ color: mark.data.get('value') }}>
                      {children}
                    </span>
                  );
                case 'bold':
                  return <strong {...attributes}>{children}</strong>;
                case 'code':
                  return <code {...attributes}>{children}</code>;
                case 'italic':
                  return <em {...attributes}>{children}</em>;
                case 'underlined':
                  return <u {...attributes}>{children}</u>;
                default:
                  return next();
              }
            }}
          </Observer>
        )}
      />
    );
  },
  (prevProps, nextProps) => prevProps.value === nextProps.value
);
