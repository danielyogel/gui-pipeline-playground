import { GetVmType } from 'utils/utils';
import { State, Computed, Methods, Children } from 'utils/Init';
import { IComputedValue } from 'mobx';
import { ApiServiceType } from 'store/abstract/ApiService';
import CategoryModel from 'store/abstract/CategoryModel';
import { ModalServiceType } from 'store/abstract/modalVM';
import MediaVM from 'pages/application/media/Media';
import UserProfile from 'pages/application/UserProfile/UserProfile';
import { routerType } from 'utils/RouterFactory';
import TemplateTab from 'pages/application/templates/Templates';
import CategoryList from 'pages/application/catagories/categoey_list/catergoryList';
import CategoryNew from 'pages/application/catagories/categoey_new/categoryNew';
import CampaignsTab from 'pages/application/campaigns';
import { pipe } from 'utils/fp';
import Licenses from './licenses';
import Devices from './devices';

type INNER_PAGE =
  | 'CATEGORY'
  | 'CAMPAIGNS'
  | 'PRODUCTS'
  | 'STICKERS'
  | 'LICENSES'
  | 'DEVICES'
  | 'TEMPLATES'
  | 'BACKGROUNDS'
  | 'PROFILE'
  | null;

type Params = {
  mode: IComputedValue<'PLATFORM' | 'USER' | null>;
  selectedPage: IComputedValue<INNER_PAGE>;
  selectedCategoryId: IComputedValue<string | null>;
  navigate: routerType['navigate'];
  logOut: () => void;
  userName: IComputedValue<string | undefined>;
  apiService: ApiServiceType;
  modalService: ModalServiceType;
  categoryModel: ReturnType<typeof CategoryModel>;
  isVisible: IComputedValue<boolean>;
  children: {
    licenses: ReturnType<typeof Licenses>;
    devices: ReturnType<typeof Devices>;
    categoryList: ReturnType<typeof CategoryList>;
    categoeyNew: ReturnType<typeof CategoryNew>;
    templates: ReturnType<typeof TemplateTab>;
    campaigns: ReturnType<typeof CampaignsTab>;
    stickers: ReturnType<typeof MediaVM>;
    backgrounds: ReturnType<typeof MediaVM>;
    userProfile: ReturnType<typeof UserProfile>;
  };
};

export function Application({
  selectedPage,
  navigate,
  logOut,
  userName,
  selectedCategoryId,
  categoryModel,
  isVisible,
  children,
  mode
}: Params) {
  return pipe(
    State({ isSideBarOpen: true, isSideBarHovered: false }),
    Computed(({ state }) => {
      const unDeletedCategories = categoryModel.computed.get().unDeletedCategories;
      const shouldOpenSideBar = state.get().isSideBarHovered || state.get().isSideBarOpen;
      return {
        userVisibility: mode.get(),
        selectedCategoryId: selectedCategoryId.get(),
        shouldOpenSideBar,
        selectedPage: selectedPage.get(),
        userName: userName.get(),
        unDeletedCategories,
        isVisible: isVisible.get()
      };
    }),
    Methods(({ state }) => ({
      navigate,
      logOut,
      toggleSideBar(newState?: boolean) {
        if (newState !== undefined) {
          state.get().isSideBarOpen = newState;
        } else {
          state.get().isSideBarOpen = !state.get().isSideBarOpen;
        }
      },
      toggleIsSidebarHovered() {
        state.get().isSideBarHovered = !state.get().isSideBarHovered;
      },
      clear() {
        navigate['APP.CATEGORY']();
      }
    })),
    Children(() => children)
  );
}

export type ViewVmType = GetVmType<typeof Application>;
