import { IComputedValue } from 'mobx';
import { ModalServiceType } from 'store/abstract/modalVM';
import { Category, EntityStatus, MediaAsset, Product, Visibility } from 'clientApi';
import TemplateVM from 'components/template-editor/template-editor-vm';
import { TemplateServiceType } from 'store/abstract/TemplateService';
import { TypeOf } from 'io-ts';
import { TemplateV } from 'schemas/template.interfaces';
//
// INTERNALS
//
export const initInternals = function(
  templateService: TemplateServiceType,
  modalService: ModalServiceType,
  onFinish: () => void,
  stickers: IComputedValue<MediaAsset[]>,
  backgrounds: IComputedValue<MediaAsset[]>,
  products: IComputedValue<Product[]>
) {
  function _TemplateVM(template: TypeOf<typeof TemplateV>) {
    return TemplateVM({
      template,
      templateService,
      modalService,
      stickers,
      backgrounds,
      products,
      onFinish
    });
  }
  async function _addTemplatesToCategory(category: Category) {
    return templateService.getTemplatesPaged(category.id, 1, 100, Visibility.PLATFORM).then(res => {
      const templates = res.filter(({ status }) => status === EntityStatus.PUBLISH).map(_TemplateVM);
      return { category, templates };
    });
  }
  return { _addTemplatesToCategory, _TemplateVM };
};
