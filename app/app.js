/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support

import './wdyr';

import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from 'utils/history';

// Tailwind stuff
import { GlobalStyles } from 'twin.macro';
import { GlobalNotifyStyles } from 'components/Notify/GlobalNotifyStyles';

// Import root app
import App from 'containers/App';

// Import Providers
import ThemeProvider from 'containers/ThemeProvider';
import LanguageProvider from 'containers/LanguageProvider';
import ConnectionProvider from 'containers/ConnectionProvider';
import DrizzleProvider from 'containers/DrizzleProvider';
import ModalProvider from 'containers/ModalProvider';

// Import password protection
// import PasswordProtector from 'containers/PasswordProtector';

// Load the favicon and the .htaccess file
/* eslint-disable import/no-unresolved, import/extensions */
import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import 'file-loader?name=.htaccess!./.htaccess';
/* eslint-enable import/no-unresolved, import/extensions */

import configureStore from './configureStore';

// Import i18n messages
import { translationMessages } from './i18n';

// Globally require lodash
_ = require('lodash');

// Create redux store with history
const initialState = {};
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById('app');

const render = (messages) => {
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider messages={messages}>
          <DrizzleProvider store={store}>
            <ConnectionProvider>
              <ModalProvider>
                <ConnectedRouter history={history}>
                  <GlobalStyles />
                  <GlobalNotifyStyles />
                  <App />
                </ConnectedRouter>
              </ModalProvider>
            </ConnectionProvider>
          </DrizzleProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>,
    MOUNT_NODE,
  );
};

if (module.hot) {
  // Hot reloadable React components and translation json files
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept(['./i18n', 'containers/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render(translationMessages);
  });
}

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  new Promise((resolve) => {
    resolve(import('intl'));
  })
    .then(() => Promise.all([import('intl/locale-data/jsonp/en.js')]))
    .then(() => render(translationMessages))
    .catch((err) => {
      throw err;
    });
} else {
  render(translationMessages);
}

if (process.env.NODE_ENV === 'production') {
  /* eslint-disable global-require */
  const runtime = require('offline-plugin/runtime');
  runtime.install({
    onUpdating: () => {
      console.log('SW Event:', 'onUpdating');
    },
    onUpdateReady: () => {
      console.log('SW Event:', 'onUpdateReady');
      runtime.applyUpdate();
    },
    onUpdated: () => {
      console.log('SW Event:', 'onUpdated');
      window.location.reload();
    },

    onUpdateFailed: () => {
      console.log('SW Event:', 'onUpdateFailed');
    },
  });
}
