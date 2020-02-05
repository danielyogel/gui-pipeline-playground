import { State, Computed, Methods } from 'utils/Init';
import { ApiServiceType } from 'store/abstract/ApiService';
import { Category, EntityStatus } from 'clientApi';
import { pipe } from 'utils/fp';

interface Params {
  apiService: ApiServiceType;
}

export default function({ apiService }: Params) {
  return pipe(
    State({
      categories: [] as Category[],
      isCategoriesLoadeing: false,
      categoriesError: null as null | Error
    }),
    Computed(({ state }) => {
      const unDeletedCategories = state.get().categories.filter(c => c.status !== EntityStatus.DELETE);
      return { unDeletedCategories };
    }),
    Methods(({ state, setState }) => {
      return {
        onCategoryChange(id: number, change: Partial<Category>) {
          const categories = state.get().categories.map(c => {
            if (c.id === id) {
              return { ...c, ...change };
            }
            return c;
          });

          setState({ categories });
        },
        async getAll() {
          setState({ categoriesError: null, isCategoriesLoadeing: true });

          try {
            const { data } = await apiService.catagoriesApi().getAllCategories();
            setState({ categories: data });
          } catch (categoriesError) {
            setState({ categoriesError });
          } finally {
            setState({ isCategoriesLoadeing: false });
          }
        }
      };
    })
  );
}
