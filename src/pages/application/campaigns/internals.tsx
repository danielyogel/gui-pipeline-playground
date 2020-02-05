import { IComputedValue, computed as mobxComputed } from 'mobx';
import { ModalServiceType } from 'store/abstract/modalVM';
import { ApiServiceType } from 'store/abstract/ApiService';
import CampaignItem from './CampaignItem/CampaignItem';
import { Campaign, EntityStatus, MediaAsset, Product } from 'clientApi';
import { generateId } from 'utils/utils';
import TemplateVM from 'components/template-editor/template-editor-vm';

import { Params } from '.';
import { InitLogger } from 'utils/Logger';
import { TemplateFull, TemplateServiceType } from 'store/abstract/TemplateService';

export function initErrorHandler(log: ReturnType<typeof InitLogger>, modalService: ModalServiceType) {
  return {
    _handleError(message: string, error: Error) {
      log.error(message, error);
      modalService.error({ title: message });
    }
  };
}

type TemplateVmType = ReturnType<typeof TemplateVM>;

interface InternalsParams {
  stickers: IComputedValue<MediaAsset[]>;
  backgrounds: IComputedValue<MediaAsset[]>;
  products: IComputedValue<Product[]>;
  apiService: ApiServiceType;
  userTemplates: IComputedValue<TemplateVmType[]>;
  modalService: ModalServiceType;
  currView: Params['currView'];
  log: ReturnType<typeof InitLogger>;
  templateService: TemplateServiceType;
}

export function initInternals({ apiService, userTemplates, modalService, currView, log, templateService, stickers, backgrounds, products }: InternalsParams) {
  const { _handleError } = initErrorHandler(log, modalService);
  const InitTemplateVM = (template: TemplateFull) =>
    TemplateVM({
      template,
      modalService,
      templateService,
      backgrounds,
      stickers,
      products
    });

  return {
    InitTemplateVM,
    _postCampaign() {
      return apiService.campaignApi().createCampaign({
        config: {},
        name: 'NAME ' + generateId().slice(1, 3),
        status: EntityStatus.DRAFT
      });
    },
    _handleError,
    _Campaign(campaign: Campaign) {
      return CampaignItem({
        campaign,
        InitTemplateVM,
        userTemplates,
        apiService,
        modalService,
        isVisible: mobxComputed(() => currView.get() !== 'NEW' && currView.get() !== null),
        reload: mobxComputed(() => currView.get() === campaign.id)
      });
    }
  };
}
