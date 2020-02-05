import { IComputedValue, IObservableValue } from 'mobx';
import React, { FC } from 'react';

/* 

TODO:

1. Add Schema 
2. Add State
3. Add Value
4. Add onChange Type
5. add Clear keys 


*/

interface Node {
  // isAllowed: IComputedValue<boolean>;
  // state: IObservableValue<State>;
  // value: IComputedValue<Value>;
  isActive: IComputedValue<boolean>;
  isVisible: IComputedValue<boolean>;
  isDisabled: IComputedValue<boolean>;
  isLoading: IComputedValue<boolean>;
  errors: IComputedValue<Record<string, Error>>;
  mode: IComputedValue<string>;
  refresh: IComputedValue<boolean>;

  onChange: () => /* change: Partial<Value> */ void;
  onSucess: () => void;
  onFailure: () => void;
  onCancel: () => void;

  run: () => void;
  clear: () => void;
  reset: () => void;

  View: FC<Node>;
  Render: FC<{}>;

  children: Record<string, Node>;
}

interface ListNode<Item, Mode extends string, Action extends string> extends Node {
  add: (entity: Item) => void;
  remove: (index: Number) => void;
  move: (from: number, to: number) => void;
  getAll: () => void;
  getItem: (id: string) => void;
  selectedId: IObservableValue<string | null>;
  selectedEntity: IComputedValue<Item | null>;
}
