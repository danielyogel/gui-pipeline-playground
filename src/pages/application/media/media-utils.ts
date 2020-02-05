import { MediaClassification, MediaAttribution } from 'clientApi';

export const mediaAttribution: MediaAttribution = {
  author: '',
  authorUrl: '',
  license: undefined,
  source: '',
  sourceUrl: '',
  title: ''
};

export const _getTitle = (c: MediaClassification) => (c === 'BACKGROUND' ? 'Backgrounds' : 'Stickers');
