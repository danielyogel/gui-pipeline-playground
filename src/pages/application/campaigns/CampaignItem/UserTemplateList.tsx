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
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='flex-shrink-0'>
                <Observer>
                  {() => (
                    <div
                      key={template.state.id}
                      className='flex-shrink-0 w-48 bb-shadow-black hover:bb-shadow-black cursor-pointer overflow-hidden my-2 mx-2 relative group'>
                      <TemplateEditor {...template} computed={template.computed.get()} viewMode={true} />
                    </div>
                  )}
                </Observer>
              </div>
            )}
          </Draggable>
        ))}
      </>
    )}
  </Observer>
));
