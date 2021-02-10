import React, { useEffect } from 'react';
// import Splash from 'containers/Splash/Loadable';
import { useSelector, useDispatch } from 'react-redux';
// import Dashboard from 'containers/Dashboard/Loadable';
import Main from 'containers/Main/Loadable';
import { useInjectSaga } from 'utils/injectSaga';
import { useWeb3, useNotify } from 'containers/ConnectionProvider/hooks';
import { useDrizzle } from 'containers/DrizzleProvider/hooks';
import vaultsSaga from 'containers/Vaults/saga';
import GlobalStyle from '../../global-styles';
import saga from './saga';
import { selectReady } from './selectors';
import { appReady, appInitialized } from './actions';

export default function App() {
  useInjectSaga({ key: 'vaults', saga: vaultsSaga });
  useInjectSaga({ key: 'app', saga });
  const web3 = useWeb3();
  const drizzle = useDrizzle();
  const notify = useNotify();
  const dispatch = useDispatch();
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
  useEffect(appReadyChanged, [ready]);
  useEffect(init, []);
  return (
    <div>
      <canvas id="matrix" />
      <GlobalStyle />
      <Main />
    </div>
  );
}
