import { EntityStatus } from 'clientApi';

export const precedence: Record<EntityStatus, number> = {
  [EntityStatus.PUBLISH]: 5,
  [EntityStatus.PENDING]: 4,
  [EntityStatus.DRAFT]: 3,
  [EntityStatus.ARCHIVE]: 2,
  [EntityStatus.DELETE]: 1
};

export const DELETE_STATUS = EntityStatus.DELETE;
