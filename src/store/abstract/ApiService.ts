import * as Swagger from 'clientApi';
import { IComputedValue } from 'mobx';
import { Visibility } from 'clientApi';

type Params = {
  mode: IComputedValue<Visibility | null>;
  TOKEN: IComputedValue<string | null>;
};

export function CreateApiService({ mode, TOKEN }: Params) {
  const getConfig = () => new Swagger.Configuration({ ...(TOKEN.get() && { accessToken: `${TOKEN.get()}` }) });

  return {
    catagoriesApi() {
      const client = Swagger.CategoryApiFactory(getConfig());
      return {
        createCategory: client.createCategory,
        updateCategory: client.updateCategory,
        getAllCategories: client.getAllCategories
      };
    },
    mediaApi() {
      const controller = Swagger.MediaApiFactory(getConfig());
      return {  
        removeImageBackground: controller.removeImageBackground,
        uploadFile: controller.uploadFile,
        deleteMediaFile: controller.deleteMediaFile,
        importPlatformMedia: controller.importPlatformMedia,
        getMediaPaged(...args: Parameters<typeof controller.getMediaPaged>) {
          return controller.getMediaPaged(args[0], args[1], args[2], args[3] || mode.get() || undefined);
        }
      };
    },
    userApi() {
      const client = Swagger.UserApiFactory(getConfig());
      return {
        updateUser: client.updateUser,
        getUserById: client.getUserById,
        login: client.login,
        signUpNewUser: client.signUpNewUser,
        activateUser: client.activateUser
      };
    },
    productsApi() {
      const client = Swagger.ProductApiFactory(getConfig());
      return {
        getProductById: client.getProductById,
        importPlatformProduct: client.importPlatformProduct,
        getProductCategoriesByProductId: client.getProductCategoriesByProductId,
        getProductMediaByProductId: client.getProductMediaByProductId,
        updateProductById: client.updateProductById,
        updateProductCategories: client.updateProductCategories,
        addProductMedia: client.addProductMedia,
        deleteProductMedia: client.deleteProductMedia,
        deleteProduct: client.deleteProduct,
        createProduct: client.createProduct,
        getProductsPaged(...args: Parameters<typeof client.getProductsPaged>) {
          const v = args[2] || mode.get() || undefined;
          return client.getProductsPaged(args[0], args[1], v, args[3]);
        }
      };
    },
    templateApi() {
      const client = Swagger.TemplateApiFactory(getConfig());
      return {
        updateTemplateById: client.updateTemplateById,
        deleteTemplate: client.deleteTemplate,
        getTemplatesPaged(...args: Parameters<typeof client.getTemplatesPaged>) {
          const v = args[2] || mode.get() || undefined;
          return client.getTemplatesPaged(args[0], args[1], v, args[3], args[4]);
        },
        createTemplate: client.createTemplate,
        updateTemplateCategories: client.updateTemplateCategories,
        importPlatformTemplate: client.importPlatformTemplate
      };
    },
    campaignApi() {
      const client = Swagger.CampaignApiFactory(getConfig());
      return {
        createCampaign: client.createCampaign,
        deleteCampaign: client.deleteCampaign,
        getCampaignById: client.getCampaignById,
        getUserCampaigns: client.getUserCampaigns,
        updateCampaignById: client.updateCampaignById,
        updateCampaignTemplates: client.updateCampaignTemplates
      };
    },
    licensesApi() {
      const client = Swagger.LicenseApiFactory(getConfig());
      return {
        createLicense: client.createLicense,
        deleteLicense: client.deleteLicense,
        getLicenses: client.getLicenses
      };
    },
    deviceApi() {
      const client = Swagger.DeviceApiFactory(getConfig());
      return {
        createDevice: client.createDevice,
        deleteDevice: client.deleteDevice,
        getAllDevices: client.getAllDevices,
        updateDeviceById: client.updateDeviceById,
        getDeviceCampaigns: client.getDeviceCampaigns,
        updateDeviceCampaigns: client.updateDeviceCampaigns
      };
    },
    streamApi() {
      const client = Swagger.StreamerApiFactory(getConfig());
      return {
        getDeviceCampaigns: client.getDeviceCampaigns,
        updateDeviceInformation: client.updateDeviceInformation
      };
    }
  };
}

export type ApiServiceType = ReturnType<typeof CreateApiService>;
