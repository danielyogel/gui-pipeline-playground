import React from 'react';
import { observable, computed as mobxComputed, set } from 'mobx';
import { observer } from 'mobx-react';
import { PartialDeep } from 'type-fest';
import { pick, deepmerge } from 'utils/fp';
import { UiNode } from './UI/ui-interfaces';

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

export function Params<P>(params: P) {
  return { params };
}

export function Meta<T, VM>(meta: T) {
  return (vm?: VM) => {
    return { ...vm, meta };
  };
}

export function State<S>(initialState: S, o = { deep: true }) {
  const state = observable.box(initialState, o);
  const setState = (changes: Partial<S>) => state.set({ ...state.get(), ...changes });
  const mergeState = (changes: PartialDeep<S>) => state.set(deepmerge(state, changes as any, { arrayMerge: (_: any, sourceArray) => sourceArray }) as any);
  const clear = (keys?: keyof S | Array<keyof S>) => (keys ? setState(pick(initialState, keys)) : setState(initialState));

  return { state, s: state, setState, mergeState, clear, initialState };
}

export function Computed<VM, C>(getComputed: (vm: VM) => C) {
  return (vm: VM) => {
    const computed = mobxComputed(() => getComputed(vm));
    return { ...vm, computed, c: computed };
  };
}

export function Ref<VM>() {
  const _ref = React.createRef<HTMLElement>();
  return (vm: VM) => ({ ...vm, _ref });
}

export function Children<VM, C>(getChildren: (vm: VM) => C) {
  return (vm: VM) => {
    const children = getChildren(vm);
    return { ...vm, children };
  };
}

export function Methods<VM, M>(getMethods: (vm: VM) => M) {
  return (vm: VM) => ({ ...vm, methods: getMethods(vm) });
}

export function View<C extends UiNode, VM extends C>(getView: (vm: VM) => React.ReactElement) {
  return function(vm: VM) {
    const GetViewObserver = observer(getView);
    const Render = observer(() => (vm.computed.get().isVisible !== undefined && !vm.computed.get().isVisible ? null : <GetViewObserver {...vm} />));
    return { ...vm, Render };
  };
}

export function Run<VM>(runner: (vm: VM) => void) {
  return (vm: VM) => {
    runner(vm);
    return vm;
  };
}
