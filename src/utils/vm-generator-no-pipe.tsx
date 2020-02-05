import { observable, computed as mobxComputed, set } from 'mobx';
import { PartialDeep } from 'type-fest';
import { deepmerge } from 'utils/fp';

export function Init(options = { deep: true }) {
  const optionsVm = { options };
  return {
    ...optionsVm,
    meta<MetaType>(meta: MetaType) {
      const metaVm = { ...optionsVm, meta };
      return {
        ...metaVm,
        model<StateType>(modelFactory: (vm: typeof metaVm) => StateType) {
          const initialState = modelFactory(metaVm);
          const state = observable(initialState, undefined, options);
          const setState = (changes: Partial<StateType>) => set(state, changes);
          const mergeState = (changes: PartialDeep<StateType>) =>
            set(state, deepmerge(state, changes as any, { arrayMerge: (_: any, sourceArray) => sourceArray }));
          const clear = () => set(state, initialState);
          const stateMetaVm = { ...metaVm, state, setState, mergeState, clear };
          return {
            ...stateMetaVm,
            views<ComputedType>(computedFactory: (vm: typeof stateMetaVm) => ComputedType) {
              const computed = mobxComputed(() => computedFactory(stateMetaVm));

              const stateMetaComputedVm = {
                ...stateMetaVm,
                computed
              };
              return {
                ...stateMetaComputedVm,
                actions<MethodsType>(methodsFactory: (vm: typeof stateMetaComputedVm) => MethodsType) {
                  const methods = methodsFactory(stateMetaComputedVm);

                  const finalVm = { ...stateMetaComputedVm, methods, meta };
                  return {
                    ...finalVm,
                    init(initiator: (vm: typeof finalVm) => void) {
                      initiator(finalVm);
                      return finalVm;
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  };
}
