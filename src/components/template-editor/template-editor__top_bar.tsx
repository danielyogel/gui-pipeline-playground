import React from 'react';
import { If } from 'react-extras';
import { Menu, Dropdown, Icon } from 'antd';

import { EntityStatus } from 'clientApi';
import { VmType } from './template-editor-vm';
import { assertNever } from 'utils/utils';

export default function({
  meta: { templateStatus },
  state: { status },
  methods: { changeTemplateStatus, addTemplate, onFinish },
  onPreview
}: VmType & { onPreview: () => void }) {
  return (
    <section className='flex h-full items-center bg-gray-200 relative'>
      <div className='m-3 mr-10 cursor-pointer' onClick={onFinish}>
        <Icon type='rollback' className='align-baseline text-lg mr-2' />
        <span>Back</span>
      </div>
      <If condition={addTemplate !== undefined}>
        <div className='m-3 cursor-pointer' onClick={addTemplate}>
          <span>New Template</span>
          <Icon type='edit' theme='filled' className='align-middle text-lg ml-2' />
        </div>
      </If>

      <div className='m-3 cursor-pointer' onClick={() => onPreview()}>
        <span>Preview</span>
        <Icon type='fullscreen' className='align-middle text-lg ml-2' />
      </div>

      <div className='m-3'>
        <Dropdown
          overlay={
            <Menu>
              {Object.values(templateStatus).map(currStatus => (
                <Menu.Item key={currStatus} className='capitalize' onClick={changeTemplateStatus.bind(null, currStatus)}>
                  {_mapStatusToElement(currStatus)}
                </Menu.Item>
              ))}
            </Menu>
          }>
          <section className='capitalize cursor-pointer'>
            <span>{_mapStatusToElement(status)}</span> <Icon type='down' className='align-middle text-lg ml-1' />
          </section>
        </Dropdown>
      </div>

      <span className='absolute' style={{ left: '50%', transform: 'translateX(-50%)' }}>
        16/9
      </span>
    </section>
  );
}

//
// INTERNALS
//

function _mapStatusToElement(status: EntityStatus) {
  switch (status) {
    case EntityStatus.ARCHIVE:
      return <span>Archive</span>;
    case EntityStatus.DRAFT:
      return <span>Draft</span>;
    case EntityStatus.PUBLISH:
      return <span>Publish</span>;
    case EntityStatus.DELETE:
      return <span>Deleted</span>;
    case EntityStatus.PENDING:
      return <span>Pending</span>;
    default:
      return assertNever(status);
  }
}
