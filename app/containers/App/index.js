import React, { useEffect } from 'react';
// import Splash from 'containers/Splash/Loadable';
import { useSelector, useDispatch } from 'react-redux';
// import Dashboard from 'containers/Dashboard/Loadable';
import { useLocation, useHistory } from 'react-router-dom';
import Main from 'containers/Main/Loadable';
import { useInjectSaga } from 'utils/injectSaga';
import { useWeb3, useNotify } from 'containers/ConnectionProvider/hooks';
import { useDrizzle } from 'containers/DrizzleProvider/hooks';
import vaultsSaga from 'containers/Vaults/saga';
import GlobalStyle from '../../global-styles';
import saga from './saga';
import { selectReady, selectUser } from './selectors';
import {
  appReady,
  appInitialized,
  routeChanged,
  splashPageVisited,
} from './actions';
import updates from './updates.json';

const seenUpdatedSplashSeen = () =>
  new Date(localStorage.getItem('lastSplashVisit')) >=
  new Date(updates.lastSplashPageUpdate);

export default function App() {
  useInjectSaga({ key: 'vaults', saga: vaultsSaga });
  useInjectSaga({ key: 'app', saga });
  const web3 = useWeb3();
  const drizzle = useDrizzle();
  const notify = useNotify();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const user = useSelector(selectUser());
  const ready = useSelector(selectReady());
  const appReadyChanged = () => {
    if (ready) {
      dispatch(appReady(web3, drizzle, notify));
    }
  };
  const init = () => {
    console.log(`Build: ${process.env.REACT_APP_VERSION}`);
    dispatch(appInitialized());
  };
  const appRouteChanged = () => {
    if (
      location.pathname === '/' &&
      localStorage.getItem('account') &&
      !user.previousRoute &&
      seenUpdatedSplashSeen()
    ) {
      history.push('/vaults');
    } else if (location.pathname === '/') {
      dispatch(splashPageVisited());
    }
    dispatch(routeChanged(location.pathname));
  };
  useEffect(appReadyChanged, [ready]);
  useEffect(init, []);
  useEffect(appRouteChanged, [location.pathname]);
  return (
    <div>
      <canvas id="matrix" />
      <GlobalStyle />
      <Main />
    </div>
  );
}
