import { TypeOf } from 'io-ts';
import { assertNever } from 'utils/utils';
import { InitLogger } from 'utils/Logger';
import { ApiServiceType } from 'store/abstract/ApiService';
import { EntityStatus, Template, TemplateRequest, TemplateContentType, Visibility } from 'clientApi';

import { TemplateV, DEFAULT_TEMPLATE_CONTENT } from 'schemas';
import { pipe, flow } from 'utils/fp';
import { filterMap } from 'fp-ts/es6/Array';
import { fromEither } from 'fp-ts/es6/Option';
import { isLeft } from 'fp-ts/es6/Either';

export default function TemplateService({ apiService }: { apiService: ApiServiceType }) {
  return {
    async deleteTemplate(id: number) {
      await apiService.templateApi().deleteTemplate(id);
    },
    async importPlatformTemplate(id: number) {
      const { data } = await apiService.templateApi().importPlatformTemplate(id);
      return pipe(data, TemplateV.decode, validation => {
        if (isLeft(validation)) logger.validationError('invalid "importPlatformTemplate" res', validation.left);
        return validation;
      });
    },
    async updateTemplate(t: TemplateFull) {
      const res = await apiService.templateApi().updateTemplateById(t.id, _serializeTemplate(t));
      return TemplateV.decode(res.data);
    },
    async getTemplatesPaged(categoryId: number | undefined, page: number, size: number, visibility: Visibility) {
      const { data } = await apiService.templateApi().getTemplatesPaged(page, size, visibility, TemplateContentType.TEMPLATE, categoryId);
      return pipe(
        data,
        filterMap(
          flow(
            TemplateV.decode,
            validation => {
              if (isLeft(validation)) {
                logger.validationError('invalid "getTemplatesPaged" res', validation.left);
              }
              return validation;
            },
            fromEither
          )
        )
      );
    },
    async createTemplateIntoCategory(categoryId?: number) {
      const payload = {
        name: 'DEFAULT_NAME',
        status: EntityStatus.DRAFT,
        contentType: TemplateContentType.TEMPLATE,
        content: DEFAULT_TEMPLATE_CONTENT
      };

      const { data } = await apiService.templateApi().createTemplate(payload);

      if (categoryId) {
        await apiService.templateApi().updateTemplateCategories(data.id, [{ id: categoryId }]);
      }

      const validation = TemplateV.decode(data);

      if (isLeft(validation)) {
        const message = 'Template returned from createTemplateIntoCategory is invalid';
        logger.validationError(message, validation.left);

        return Promise.reject(validation.left);
      } else {
        return validation.right;
      }
    }
  };
}

//
//  INTERNALS
//

const logger = InitLogger({ dirname: 'abstract', filename: 'TemplateService.ts' });

function _serializeTemplate(t: TemplateFull): TemplateRequest {
  return {
    ...TemplateV.encode(t),
    contentType: TemplateContentType.TEMPLATE,
    status: _serializeStatus(t.status)
  };
}

const _serializeStatus = (status: Template['status']): TemplateRequest['status'] => {
  switch (status) {
    case EntityStatus.ARCHIVE:
      return EntityStatus.ARCHIVE;
    case EntityStatus.DELETE:
      return EntityStatus.DELETE;
    case EntityStatus.DRAFT:
      return EntityStatus.DRAFT;
    case EntityStatus.PENDING:
      return EntityStatus.PENDING;
    case EntityStatus.PUBLISH:
      return EntityStatus.PUBLISH;
    case undefined:
      return EntityStatus.DRAFT;
    default:
      return assertNever(status);
  }
};

//
// TYPES
//
export type TemplateFull = TypeOf<typeof TemplateV>;
export type TemplateServiceType = ReturnType<typeof TemplateService>;
