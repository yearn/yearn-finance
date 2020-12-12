import React from 'react';
import { addDecorator } from '@storybook/react';
import Layout from './Layout';
import { Provider } from 'react-redux';
import ConnectionProvider from 'containers/ConnectionProvider';
import DrizzleProvider from 'containers/DrizzleProvider';
import LanguageProvider from 'containers/LanguageProvider';
import configureStore from '../app/configureStore';
import { translationMessages } from '../app/i18n';
import history from 'utils/history';

const initialState = {};
const store = configureStore(initialState, history);

addDecorator(storyFn => (
  <Provider store={store}>
    <LanguageProvider messages={translationMessages}>
      <ConnectionProvider>
        <DrizzleProvider store={store}>
          <Layout>{storyFn()}</Layout>
        </DrizzleProvider>
      </ConnectionProvider>
    </LanguageProvider>
  </Provider>
));

export const parameters = {
  layout: 'fullscreen',
  actions: { argTypesRegex: '^on[A-Z].*' },
};
