import React from 'react';
import './styles/styles-dist.css';

import Playground from 'playground';
import {} from 'playground/pipe-vs-flow';
import { computed } from 'mobx';

const playground = Playground({ isVisible: computed(() => true) });

export default function App() {
  return (
    <>
      <playground.Render />
    </>
  );
}
