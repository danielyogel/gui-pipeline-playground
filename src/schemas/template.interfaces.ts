import * as t from 'io-ts';
import { TemplateContentType, EntityStatus } from 'clientApi';
import { IntFromString } from 'io-ts-types/lib/IntFromString';

import { generateId } from 'utils/utils';
import { NodeV } from './nodes';

const TemplateInnerContentV = t.intersection([
  t.type({
    gui_id: t.string,
    nodes: t.array(NodeV),
    selectedNode: t.union([t.string, t.null, t.undefined]),
    bg_color: t.string
  }),
  t.partial({
    metadata: t.partial({
      media: t.record(
        t.string,
        t.type({
          id: t.union([t.number, IntFromString]),
          name: t.string,
          url: t.string
        })
      )
    })
  })
]);

export const TemplateV = t.type({
  id: t.number,
  name: t.string,
  content: TemplateInnerContentV,
  contentType: t.union([t.literal(TemplateContentType.LAYOUT), t.literal(TemplateContentType.TEMPLATE), t.literal(TemplateContentType.THEME)]),
  status: t.union([
    t.literal(EntityStatus.ARCHIVE),
    t.literal(EntityStatus.DELETE),
    t.literal(EntityStatus.DRAFT),
    t.literal(EntityStatus.PENDING),
    t.literal(EntityStatus.PUBLISH)
  ]),
  creationDate: t.string,
  updateDate: t.string
});

//
//  DEFAULTS
//

export const DEFAULT_TEMPLATE_CONTENT: t.TypeOf<typeof TemplateInnerContentV> = {
  gui_id: generateId(),
  bg_color: 'white',
  nodes: [],
  selectedNode: null
};
