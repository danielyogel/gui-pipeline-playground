interface Node {
  isVisible: boolean;
  [k: string]: any;
}

export type UiNode = Partial<Node>;
