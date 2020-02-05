import { Modal } from 'antd';

export const CreateModalService = () => {
  return Modal;
};

export type ModalServiceType = ReturnType<typeof CreateModalService>;
