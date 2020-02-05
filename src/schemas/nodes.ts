import * as t from 'io-ts';
import { withFallback } from 'io-ts-types/lib/withFallback';
import { SlateValueV } from './SlateValueV';
import { strEnum } from 'utils/utils';

const IdV = t.type({ ID: t.string });

const DimensionsV = t.type({
  top: t.number,
  left: t.number,
  width: t.union([t.number, t.literal('auto')]),
  height: t.union([t.number, t.literal('auto')])
});

const BaseV = t.intersection([IdV, DimensionsV]);

const SvgBaseV = t.intersection([
  BaseV,
  t.type({
    fill: withFallback(t.string, 'white'),
    stroke: withFallback(t.string, 'white'),
    'stroke-width': withFallback(t.string, '1px'),
    'stroke-dasharray': withFallback(t.string, '0px')
  })
]);

const ImageNodeV = t.intersection([
  BaseV,
  t.type({
    KIND: t.literal('IMAGE'),
    entity: t.union([t.null, t.literal('BACKGROUND'), t.literal('STICKER'), t.literal('PRODUCT_IMAGE')]),
    content: t.string,
    refRes: t.type({
      id: t.number,
      kind: t.literal('MEDIA')
    })
  })
]);

const StaticImageV = t.intersection([
  BaseV,
  t.type({
    KIND: t.literal('STATIC_IMAGE'),
    content: t.string,
    entity: t.literal('BUILDBOARD_LOGO')
  })
]);

const TextNodeV = t.intersection([
  BaseV,
  t.type({
    KIND: t.literal('TEXT'),
    content: SlateValueV,
    color: t.string,
    font_weight: t.union([t.literal('bold'), t.literal('normal'), t.literal('bolder'), t.literal('lighter')]),
    font_style: t.union([t.literal('italic'), t.literal('normal')]),
    text_decoration: t.union([t.literal('none'), t.literal('underline'), t.literal('line-through')])
  })
]);

const CircleNodeV = t.intersection([
  SvgBaseV,
  t.type({
    KIND: t.literal('CIRCLE' as const)
  })
]);

const RectangleNodeV = t.intersection([
  SvgBaseV,
  t.type({
    KIND: t.literal('RECTANGLE' as const)
  })
]);

const TriangleNodeV = t.intersection([
  SvgBaseV,
  t.type({
    KIND: t.literal('TRIANGLE' as const)
  })
]);

export const SvgNodeV = t.union([CircleNodeV, RectangleNodeV, TriangleNodeV]);

export const NodeV = t.union([SvgNodeV, ImageNodeV, StaticImageV, TextNodeV]);

//
//  Types
//
export type NodeDimensions = t.TypeOf<typeof DimensionsV>;
export type StaticImageNode = t.TypeOf<typeof StaticImageV>;
export type TextNode = t.TypeOf<typeof TextNodeV>;
export type CircleNode = t.TypeOf<typeof CircleNodeV>;
export type RectangleNode = t.TypeOf<typeof RectangleNodeV>;
export type TriangleNode = t.TypeOf<typeof TriangleNodeV>;
export type ImageNode = t.TypeOf<typeof ImageNodeV>;
export type Node = ImageNode | StaticImageNode | TextNode | CircleNode | RectangleNode | TriangleNode;
export type NodeKind = Node['KIND'];

//
// Helpers
//
export const NodeKind = strEnum(['IMAGE', 'STATIC_IMAGE', 'CIRCLE', 'RECTANGLE', 'TRIANGLE', 'TEXT']);
export const SvgKinds = SvgNodeV.types.map(t => t.types[1].props.KIND.value);
