import React from 'react';
import './styles/styles-dist.css';

import HomePage from 'pages/HomePage';
import store from 'store';
import AppPage from 'pages/application';

const { login, signup, streamer } = store;

export default function App() {
  return (
    <>
      <HomePage />
      <login.Render />
      <signup.Render />
      <streamer.Render />
      <AppPage></AppPage>
    </>
  );
}
