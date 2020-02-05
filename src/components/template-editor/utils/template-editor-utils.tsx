import React from 'react';
import { Icon } from 'antd';
import { Value } from 'slate';
import { pickBy, omit } from 'utils/fp';

import { generateRandomColor, getRandomInt, generateId, assertNever } from 'utils/utils';
import { NodeKind, NodeDimensions, ImageNode, StaticImageNode, CircleNode, TriangleNode, RectangleNode, TextNode } from 'schemas';
import logoUrl from 'Logo-GRT.png';

import { MediaAsset } from 'clientApi';

export function initNodeGenerators(screenRatio: number) {
  function _generateRandomCircle(): CircleNode {
    return {
      KIND: NodeKind.CIRCLE,
      ID: generateId(),
      top: getRandomInt(50) / 100,
      left: getRandomInt(50) / 100,
      width: 0.1,
      height: 0.1 * screenRatio,
      fill: generateRandomColor(),
      stroke: 'red',
      'stroke-width': '1px',
      'stroke-dasharray': '0px'
    };
  }

  function _generateRandomRectangle(): RectangleNode {
    return {
      KIND: NodeKind.RECTANGLE,
      ID: generateId(),
      top: getRandomInt(50) / 100,
      left: getRandomInt(50) / 100,
      width: 0.1,
      height: 0.1 * screenRatio,
      fill: generateRandomColor(),
      stroke: 'red',
      'stroke-width': '1px',
      'stroke-dasharray': '0px'
    };
  }

  function _generateRandomTriangle(): TriangleNode {
    return {
      KIND: NodeKind.TRIANGLE,
      ID: generateId(),
      top: getRandomInt(50) / 100,
      left: getRandomInt(50) / 100,
      width: 0.1,
      height: 0.1 * screenRatio,
      fill: generateRandomColor(),
      stroke: 'red',
      'stroke-width': '1px',
      'stroke-dasharray': '0px'
    };
  }

  function _generateText(): TextNode {
    return {
      KIND: NodeKind.TEXT,
      ID: generateId(),
      content: Value.fromJSON(INITIAL_TEXT_VALUE as any),
      color: 'black',
      font_weight: 'normal' as const,
      font_style: 'normal' as const,
      text_decoration: 'none' as const,
      top: getRandomInt(50) / 100,
      left: getRandomInt(50) / 100,
      width: 0.3,
      height: 0.2 * screenRatio
    };
  }

  function _generateImage(media: MediaAsset, entity: ImageNode['entity']): ImageNode {
    const isBackround = entity === 'BACKGROUND';
    return {
      KIND: NodeKind.IMAGE,
      entity,
      ID: generateId(),
      content: '',
      top: isBackround ? 0 : getRandomInt(50) / 100,
      left: isBackround ? 0 : getRandomInt(50) / 100,
      width: isBackround ? 1 : 0.1,
      height: isBackround ? 1 : 'auto',
      refRes: {
        kind: 'MEDIA',
        id: media.id
      }
    } as const;
  }

  function _generateStaticImage(entity: StaticImageNode['entity']): StaticImageNode {
    return {
      KIND: NodeKind.STATIC_IMAGE,
      entity,
      ID: generateId(),
      content: logoUrl,
      top: getRandomInt(50) / 100,
      left: getRandomInt(50) / 100,
      width: 0.4,
      height: 'auto'
    } as const;
  }

  return {
    [NodeKind.STATIC_IMAGE]: _generateStaticImage,
    [NodeKind.IMAGE]: _generateImage,
    [NodeKind.TEXT]: _generateText,
    [NodeKind.CIRCLE]: _generateRandomCircle,
    [NodeKind.RECTANGLE]: _generateRandomRectangle,
    [NodeKind.TRIANGLE]: _generateRandomTriangle
  };
}

export function InitConvertors(containerWidth: number, containerHeight: number) {
  function toPercentage(changes: Partial<NodeDimensions>) {
    return pickBy(
      {
        left: changes.left !== undefined && changes.left / containerWidth,
        top: changes.top !== undefined && changes.top / containerHeight,
        width: changes.width === 'auto' ? 'auto' : changes.width !== undefined && changes.width / containerWidth,
        height: changes.height === 'auto' ? 'auto' : changes.height !== undefined && changes.height / containerHeight
      },
      v => v !== false
    );
  }

  function toPixels(params: NodeDimensions) {
    const x = params.left * containerWidth;
    const y = params.top * containerHeight;
    const width = params.width === 'auto' ? 'auto' : params.width * containerWidth;
    const height = params.height === 'auto' ? 'auto' : params.height * containerHeight;
    return { width, height, x, y };
  }

  return { toPercentage, toPixels };
}

export function NodeViewer({ nodeKind, style }: { nodeKind: NodeKind; style?: React.CSSProperties }) {
  switch (nodeKind) {
    case NodeKind.CIRCLE:
    case NodeKind.RECTANGLE:
    case NodeKind.TRIANGLE:
      return <SVGNodeViewer nodeKind={nodeKind} style={style} />;
    case NodeKind.TEXT:
      return <Icon type='font-size' style={{ color: 'white', ...omit(style, ['width', 'height']) }} />;
    case NodeKind.IMAGE:
    case NodeKind.STATIC_IMAGE:
      return <Icon type='picture' style={{ color: 'white', ...omit(style, ['width', 'height']) }} />;
    default:
      return assertNever(nodeKind);
  }
}

function SVGNodeViewer({ nodeKind, style }: { nodeKind: 'CIRCLE' | 'TRIANGLE' | 'RECTANGLE'; style?: React.CSSProperties }) {
  return (
    <svg viewBox='0 0 100 100' preserveAspectRatio='none' className='block h-full w-full' stroke='gray' strokeWidth='2px' fill='white' style={style}>
      {nodeKind === 'CIRCLE' ? (
        <circle cx='50%' cy='50%' r='50%' />
      ) : nodeKind === 'TRIANGLE' ? (
        <polygon points='50,0 100,100 0,100' />
      ) : nodeKind === 'RECTANGLE' ? (
        <rect x='0' y='0' width='100' height='100' />
      ) : (
        assertNever(nodeKind)
      )}
    </svg>
  );
}

const INITIAL_TEXT_VALUE = {
  object: 'value',
  document: {
    object: 'document',
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: ''
          }
        ]
      }
    ]
  }
};
