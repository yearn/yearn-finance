/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Splash from 'containers/Splash/Loadable';
import Dashboard from 'containers/Dashboard/Loadable';
import Main from 'containers/Main/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import GlobalStyle from '../../global-styles';
import vaultsSaga from './sagas/vaultsSaga';
import reducer from './reducer';

export default function App() {
  useInjectSaga({ key: 'vaults', saga: vaultsSaga });
  useInjectReducer({ key: 'app', reducer });
  return (
    <div>
      <Switch>
        <Route exact path="/" component={Splash} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route path="/vaults" component={Main} />
        <Route path="/yusd" component={Main} />
        <Route path="/stats" component={Main} />
        <Route path="/gov" component={Main} />
        <Route component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </div>
  );
}
