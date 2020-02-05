import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { IComputedValue } from 'mobx';
import { Observer } from 'mobx-react';
import TemplateVM from 'components/template-editor/template-editor-vm';
import TemplateEditor from 'components/template-editor/template-editor';

type TemplateVmType = ReturnType<typeof TemplateVM>;

interface Params {
  items: IComputedValue<TemplateVmType[]>;
}

export default React.memo(({ items }: Params) => (
  <Observer>
    {() => (
      <>
        {items.get().map((template, index) => (
          <Draggable draggableId={template.state.id.toString()} index={index} key={template.state.id}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='w-64 flex-shrink-0 px-4 py-6'>
                <Observer>{() => <TemplateEditor {...template} computed={template.computed.get()} viewMode={true} />}</Observer>
              </div>
            )}
          </Draggable>
        ))}
      </>
    )}
  </Observer>
));
