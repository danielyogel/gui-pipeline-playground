import { computed } from 'mobx';
import Router from 'utils/RouterFactory';
import { InitLogger } from 'utils/Logger';
import { CreateApiService } from 'store/abstract/ApiService';
import { CreateModalService } from 'store/abstract/modalVM';
import CategoryModel from 'store/abstract/CategoryModel';
import TemplateService, { TemplateFull } from 'store/abstract/TemplateService';
import UserProfile from 'pages/application/UserProfile/UserProfile';
import { Application } from '../pages/application/Application';
import Login from '../pages/login/login';
import Signup from '../pages/signup/signup';
import CreateNewCategoryVM from 'pages/application/catagories/categoey_new/categoryNew';
import CreateEditCategoryVM from 'pages/application/catagories/CategoryEdit/categoeryEditVM';
import CategoryListVM from 'pages/application/catagories/categoey_list/catergoryList';
import MediaVM from 'pages/application/media/Media';
import Streamer from 'pages/streamer';
import TemplateTab from 'pages/application/templates/Templates';
import Licenses from 'pages/application/licenses';
import Devices from 'pages/application/devices';
import CampaignsTab from 'pages/application/campaigns';
import { CreateProductsVM } from 'pages/application/products/ProductsVM';
import CreateProfileVM from './abstract/profileVM';
import { Category, MediaClassification } from 'clientApi';
import CreateTemplateVM from 'components/template-editor/template-editor-vm';

const log = InitLogger({ dirname: __dirname, filename: __filename });

if (process.env.NODE_ENV === 'production' && typeof process.env.REACT_APP_API_PATH !== 'string') {
  throw new Error('BB_APP_CLIENT FAILURE: please provide REACT_APP_API_PATH envirment variable');
}

log.group(`BB-CLIENT INITIALIZATION SUCCESS!`);
log.success(`process.env.REACT_APP_API_PATH: ${process.env.REACT_APP_API_PATH || 'undefined'}`);
log.success(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
log.groupEnd();

const router = Router(
  {
    HOMEPAGE: '/',
    ACTIVATION: '/user/activation/:userId/:userCode',
    LOGIN: '/login',
    SIGNUP: '/signup',
    APP: '/app',
    STREAM: '/stream/:id',
    'APP.CAMPAIGNS': '/campaigns',
    'APP.CAMPAIGNS.NEW': '/new',
    'APP.CAMPAIGNS.EDIT': '/:id',
    'APP.DEVICES': '/devices',
    'APP.DEVICES.NEW': '/new',
    'APP.DEVICES.EDIT': '/:id',
    'APP.TEMPLATES': '/template',
    'APP.TEMPLATES.EDIT': '/:id',
    'APP.CATEGORY': '/category',
    'APP.BACKGROUNDS': '/background',
    'APP.STICKERS': '/sticker',
    'APP.LICENSES': '/licenses',
    'APP.LICENSES.NEW': '/new',
    'APP.LICENSES.EDIT': '/:id',
    'APP.PROFILE': '/profile',
    'APP.PRODUCTS': '/product',
    'APP.PRODUCTS.EDIT': '/:id',
    'APP.CATEGORY.NEW': '/new',
    'APP.CATEGORY.EDIT': '/:id',
    'APP.CATEGORY.EDIT.TEMPLATE': '/template/:templateId',
    'APP.CATEGORY.EDIT.PRODUCT': '/product',
    'APP.CATEGORY.EDIT.PRODUCT.EDIT': '/:productId'
  },
  'HOMEPAGE'
);

const modalService = CreateModalService();

const profileVM = CreateProfileVM({
  modalService,
  onModeChange: (mode: 'USER' | 'PLATFORM' | null) =>
    router.navigate[mode === 'USER' ? 'APP.CAMPAIGNS' : mode === 'PLATFORM' ? 'APP.CATEGORY' : 'LOGIN'](),
  initActivation: router.selectedPage.get() === 'ACTIVATION' && {
    userCode: router.params.get().userCode,
    userId: router.params.get().userId
  }
});

switch (profileVM.computed.get().mode) {
  case 'PLATFORM':
    if (
      (['APP.CAMPAIGNS', 'APP.TEMPLATES', 'APP.DEVICES', 'LOGIN', 'SIGNUP', 'HOMEPAGE'] as const).find(r =>
        router.activeNodes[r].get()
      )
    ) {
      router.navigate['APP.CATEGORY']();
    }

    break;

  case 'USER':
    if ((['APP.CATEGORY', 'LOGIN', 'SIGNUP', 'HOMEPAGE', 'APP.LICENSES'] as const).find(r => router.activeNodes[r].get())) {
      router.navigate['APP.CAMPAIGNS']();
    }
    break;

  case null:
    if (!(['LOGIN', 'SIGNUP', 'HOMEPAGE', 'STREAM'] as const).find(r => router.activeNodes[r].get())) {
      router.navigate['LOGIN']();
    }
    break;
}

const mode = computed(() => profileVM.computed.get().mode);

const apiService = CreateApiService({ TOKEN: computed(() => profileVM.state.get().token), mode });

const categoryModel = CategoryModel({ apiService });

const categoryList = CategoryListVM({
  categoryModel,
  apiService,
  modalService,
  refresh: computed(
    () =>
      mode.get() !== null &&
      (router.activeNodes['APP.CATEGORY'].get() ||
        router.activeNodes['APP.PRODUCTS'].get() ||
        router.activeNodes['APP.TEMPLATES'].get() ||
        router.activeNodes['APP.CAMPAIGNS'].get())
  ),
  isVisible: computed(() => router.selectedPage.get() === 'APP.CATEGORY'),
  createCategoey: () => router.navigate['APP.CATEGORY.NEW'](),
  onSelectCategory: (id: string) => {
    router.navigate['APP.CATEGORY.EDIT']({ id });
  },
  InitCategoryVM: _InitCategoryVM
});

const categoeyNew = CreateNewCategoryVM({
  apiService,
  modalService,
  initalize: router.activeNodes['APP.CATEGORY.NEW'],
  categoryModel,
  onCancel: router.navigate['APP.CATEGORY'],
  onSucess: () => {
    categoryModel.methods.getAll();
    router.navigate['APP.CATEGORY']();
  }
});

const templateService = TemplateService({ apiService });

const campaigns = CampaignsTab({
  apiService,
  modalService,
  stickers: computed(() => stickers.state.get().platformItems),
  backgrounds: computed(() => backgrounds.state.get().platformItems),
  products: computed(() => productListVM.state.userItems),
  currView: computed(() => {
    const ID = router.params.get() && Number(router.params.get().id);
    if (!router.activeNodes['APP.CAMPAIGNS'].get() || mode.get() !== 'USER') {
      return null;
    } else if (router.activeNodes['APP.CAMPAIGNS.NEW'].get()) {
      return 'NEW';
    } else if (router.activeNodes['APP.CAMPAIGNS.EDIT'].get() && ID) {
      return ID;
    } else {
      return 'LIST';
    }
  }),
  selectView: (view: number | 'LIST' | 'NEW') => {
    if (typeof view === 'number') {
      router.navigate['APP.CAMPAIGNS.EDIT']({ id: String(view) });
    } else if (view === 'NEW') {
      router.navigate['APP.CAMPAIGNS.NEW']();
    } else {
      router.navigate['APP.CAMPAIGNS']();
    }
  },
  templateService
});

const streamer = Streamer({
  apiService,
  isVisible: computed(() => router.activeNodes.STREAM.get()),
  deviceId: computed(() => router.params.get().id),
  InitTemplateVM
});

const stickers = MediaVM({
  apiService,
  modalService,
  classification: MediaClassification.STICKER,
  mode: computed(() => (router.activeNodes['APP.STICKERS'].get() ? mode.get() : null)),
  refresh: computed(
    () =>
      mode.get() !== null &&
      (router.activeNodes['APP.STICKERS'].get() ||
        router.activeNodes['APP.TEMPLATES'].get() ||
        router.activeNodes['APP.CAMPAIGNS'].get() ||
        router.activeNodes['APP.CATEGORY'].get())
  )
});

const backgrounds = MediaVM({
  apiService,
  modalService,
  classification: MediaClassification.BACKGROUND,
  mode: computed(() => (router.activeNodes['APP.BACKGROUNDS'].get() ? mode.get() : null)),
  refresh: computed(
    () =>
      mode.get() !== null &&
      (router.activeNodes['APP.BACKGROUNDS'].get() ||
        router.activeNodes['APP.TEMPLATES'].get() ||
        router.activeNodes['APP.CAMPAIGNS'].get() ||
        router.activeNodes['APP.CATEGORY'].get())
  )
});

const { productsVM, productListVM, productPutVM } = CreateProductsVM({
  mode,
  refresh: computed(
    () =>
      mode.get() !== null &&
      (router.activeNodes['APP.PRODUCTS'].get() ||
        router.activeNodes['APP.TEMPLATES'].get() ||
        router.activeNodes['APP.CAMPAIGNS'].get() ||
        router.activeNodes['APP.CATEGORY'].get())
  ),
  inCategoeyMode: false,
  allCategories: computed(() => categoryList.state.get().catagoryVMs.map(vm => vm.state.categoryForm)),
  selectedView: computed(() => {
    const ID = router.params.get() && Number(router.params.get().id);
    if (router.activeNodes['APP.PRODUCTS'].get() === false) {
      return null;
    } else if (router.activeNodes['APP.PRODUCTS.EDIT'].get() && ID) {
      return ID;
    } else {
      return 'LIST';
    }
  }),
  onSelectId: (id: number | null) => {
    if (id) {
      router.navigate['APP.PRODUCTS.EDIT']({ id: String(id) });
    } else {
      router.navigate['APP.PRODUCTS']();
      categoryList.methods.getAll();
    }
  },
  modalService,
  apiService
});

const templates = TemplateTab({
  catagories: computed(() => categoryList.state.get().catagoryVMs.map(vm => vm.state.categoryForm)),
  templateService,
  modalService,
  currView: computed(() => {
    const ID = router.params.get() && Number(router.params.get().id);
    if (router.activeNodes['APP.TEMPLATES'].get() === false || mode.get() !== 'USER') {
      return null;
    } else if (router.activeNodes['APP.TEMPLATES.EDIT'].get() && ID) {
      return ID;
    } else {
      return 'LIST';
    }
  }),
  selectView: (id: number | null) => {
    if (id) {
      router.navigate['APP.TEMPLATES.EDIT']({ id: String(id) });
    } else {
      router.navigate['APP.TEMPLATES']();
    }
  },
  stickers: computed(() => stickers.state.get().platformItems),
  backgrounds: computed(() => backgrounds.state.get().platformItems),
  products: computed(() => productListVM.state.userItems)
});

const userProfile = UserProfile({
  initalize: router.activeNodes['APP.PROFILE'],
  userId: computed(() => profileVM.state.get().user?.id),
  apiService,
  onFinish: () => {
    applicationPageVM.methods.clear();
    profileVM.methods.refreshUser();
  }
});

const licenses = Licenses({
  apiService,
  modalService,
  isVisible: router.activeNodes['APP.LICENSES'],
  currView: computed(() => {
    const ID = router.params.get() && Number(router.params.get().id);
    if (router.activeNodes['APP.LICENSES'].get() === false || mode.get() !== 'PLATFORM') {
      return null;
    } else if (router.activeNodes['APP.LICENSES.EDIT'].get() && ID) {
      return ID;
    } else if (router.activeNodes['APP.LICENSES.NEW'].get()) {
      return 'NEW';
    } else {
      return 'LIST';
    }
  }),
  selectView: v => {
    if (typeof v === 'number') {
      router.navigate['APP.LICENSES.EDIT']({ id: String(v) });
    } else if (v === 'LIST') {
      router.navigate['APP.LICENSES']();
    } else if (v === 'NEW') {
      router.navigate['APP.LICENSES.NEW']();
    }
  }
});

const devices = Devices({
  apiService,
  modalService,
  currView: computed(() => {
    const ID = router.params.get() && Number(router.params.get().id);
    if (mode.get() !== 'USER' || router.activeNodes['APP.DEVICES'].get() === false) {
      return null;
    } else if (router.activeNodes['APP.DEVICES.EDIT'].get() && ID) {
      return ID;
    } else if (router.activeNodes['APP.DEVICES.NEW'].get()) {
      return 'NEW';
    } else {
      return 'LIST';
    }
  }),
  selectView: v => {
    if (typeof v === 'number') {
      router.navigate['APP.DEVICES.EDIT']({ id: String(v) });
    } else if (v === 'LIST') {
      router.navigate['APP.DEVICES']();
    } else if (v === 'NEW') {
      router.navigate['APP.DEVICES.NEW']();
    }
  }
});

const applicationPageVM = Application({
  mode,
  isVisible: router.activeNodes.APP,
  selectedPage: computed(() => {
    const APP_KEYS = [
      ['CATEGORY', 'APP.CATEGORY'],
      ['CAMPAIGNS', 'APP.CAMPAIGNS'],
      ['PRODUCTS', 'APP.PRODUCTS'],
      ['LICENSES', 'APP.LICENSES'],
      ['DEVICES', 'APP.DEVICES'],
      ['STICKERS', 'APP.STICKERS'],
      ['TEMPLATES', 'APP.TEMPLATES'],
      ['BACKGROUNDS', 'APP.BACKGROUNDS'],
      ['PROFILE', 'APP.PROFILE']
    ] as const;

    const match = APP_KEYS.find(([_, route]) => router.activeNodes[route].get());
    return match ? match[0] : null;
  }),
  navigate: router.navigate,
  logOut: profileVM.methods.logOut,
  userName: computed(() => profileVM.state.get().user?.userName),
  apiService,
  categoryModel,
  modalService,
  selectedCategoryId: computed(() => {
    const isPageActive = router.activeNodes['APP.CATEGORY.EDIT'].get();
    const p = router.params.get();
    if (!isPageActive) {
      return null;
    }
    if (!p) {
      return null;
    }

    return p.id;
  }),
  children: { licenses, devices, stickers, backgrounds, templates, campaigns, userProfile, categoryList, categoeyNew }
});

const login = Login({
  apiService,
  profileVM,
  toSignup: router.navigate.SIGNUP,
  isVisible: router.activeNodes.LOGIN,
  toHome: router.navigate.HOMEPAGE
});
const signup = Signup({
  apiService,
  toLogin: router.navigate.LOGIN,
  isVisible: router.activeNodes.SIGNUP,
  toHome: router.navigate.HOMEPAGE
});

export default {
  streamer,
  profileVM,
  applicationPageVM,
  userProfile,
  login,
  signup,
  categoryList,
  categoeyNew,
  productsVM,
  productListVM,
  productPutVM,
  router
};

export type ApiServiceType = typeof apiService;
export type RouterType = typeof router;

//
// INTERNALS
//
function _InitCategoryVM(category: Category) {
  const setView: (
    v:
      | { PAGE: null }
      | { PAGE: 'TEMPLATE_LIST' }
      | { PAGE: 'TEMPLATE_EDIT'; id: string }
      | { PAGE: 'PRODUCT_LIST' }
      | { PAGE: 'PRODUCT_EDIT'; id: string }
  ) => void = v => {
    if (v.PAGE === null) {
      router.navigate['APP.CATEGORY']();
    } else if (v.PAGE === 'TEMPLATE_LIST') {
      router.navigate['APP.CATEGORY.EDIT']({ ...router.params.get() });
    } else if (v.PAGE === 'TEMPLATE_EDIT') {
      router.navigate['APP.CATEGORY.EDIT.TEMPLATE']({ ...router.params.get(), templateId: v.id });
    } else if (v.PAGE === 'PRODUCT_LIST') {
      router.navigate['APP.CATEGORY.EDIT.PRODUCT']({ ...router.params.get() });
    } else if (v.PAGE === 'PRODUCT_EDIT') {
      router.navigate['APP.CATEGORY.EDIT.PRODUCT.EDIT']({ ...router.params.get(), productId: v.id });
    }
  };
  const selectedView = computed(() => {
    const id = router.params.get() && Number(router.params.get().id);
    if (router.activeNodes['APP.CATEGORY.EDIT'].get() && id === category.id) {
      if (router.selectedPage.get() === 'APP.CATEGORY.EDIT.TEMPLATE') {
        const id = router.params.get() && router.params.get().templateId;
        return id ? { PAGE: 'TEMPLATE_EDIT' as const, id } : { PAGE: null };
      } else if (router.selectedPage.get() === 'APP.CATEGORY.EDIT.PRODUCT') {
        return { PAGE: 'PRODUCT_LIST' as const };
      } else if (router.selectedPage.get() === 'APP.CATEGORY.EDIT.PRODUCT.EDIT') {
        const id = router.params.get() && router.params.get().productId;
        return id ? { PAGE: 'PRODUCT_EDIT' as const, id } : { PAGE: null };
      }
      return { PAGE: 'TEMPLATE_LIST' as const };
    }
    return { PAGE: null };
  });

  const categoryProductsVMS = CreateProductsVM({
    mode: mode,
    refresh: computed(
      () =>
        mode.get() !== null &&
        (router.activeNodes['APP.PRODUCTS'].get() ||
          router.activeNodes['APP.TEMPLATES'].get() ||
          router.activeNodes['APP.CAMPAIGNS'].get() ||
          router.activeNodes['APP.CATEGORY'].get())
    ),
    inCategoeyMode: category.id,
    onSelectId: id => (id ? setView({ PAGE: 'PRODUCT_EDIT', id: String(id) }) : setView({ PAGE: 'PRODUCT_LIST' })),
    selectedView: computed(() => {
      const VIEW = selectedView.get();
      if (VIEW.PAGE === 'PRODUCT_EDIT') return Number(VIEW.id);
      else if (VIEW.PAGE === 'PRODUCT_LIST') return 'LIST';
      else return null;
    }),
    allCategories: computed(() => categoryList.state.get().catagoryVMs.map(vm => vm.state.categoryForm)),
    apiService,
    modalService
  });

  return CreateEditCategoryVM({
    category,
    onChange: (c: Partial<Category>) => categoryModel.methods.onCategoryChange(category.id, c),
    setView,
    currView: selectedView,
    catProdVms: categoryProductsVMS,

    templateServ: templateService,
    stickers: computed(() => stickers.state.get().platformItems),
    backgrounds: computed(() => backgrounds.state.get().platformItems),

    apiServ: apiService,
    modalServ: modalService
  });
}

function InitTemplateVM(template: TemplateFull) {
  return CreateTemplateVM({
    stickers: computed(() => stickers.state.get().platformItems),
    backgrounds: computed(() => backgrounds.state.get().platformItems),
    modalService,
    products: computed(() => productListVM.state.userItems),
    template,
    templateService
  });
}
