/**
 * Create the store with dynamic reducers
 */

import { createStore, applyMiddleware, compose } from 'redux';
import { drizzleSagas } from 'drizzle/store';
import { routerMiddleware } from 'connected-react-router';
import { all, fork } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import drizzleMiddleware from 'drizzle/store/drizzle-middleware';
import drizzleWeb3Middleware from 'middleware/drizzleWeb3';
// import websocketMiddleware from 'middleware/websocket';
import createReducer from './reducers';

export default function configureStore(initialState = {}, history) {
  let composeEnhancers = compose;
  const reduxSagaMonitorOptions = {};

  // If Redux Dev Tools and Saga Dev Tools Extensions are installed, enable them
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
    /* eslint-disable no-underscore-dangle */
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});

    // NOTE: Uncomment the code below to restore support for Redux Saga
    // Dev Tools once it supports redux-saga version 1.x.x
    // if (window.__SAGA_MONITOR_EXTENSION__)
    //   reduxSagaMonitorOptions = {
    //     sagaMonitor: window.__SAGA_MONITOR_EXTENSION__,
    //   };
    /* eslint-enable */
  }

  const composeSagas = (sagas) =>
    // eslint-disable-next-line
    function* () {
      yield all(sagas.map(fork));
    };

  const sagaMiddleware = createSagaMiddleware(
    composeSagas(reduxSagaMonitorOptions),
  );

  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state

  const middlewares = [
    drizzleMiddleware,
    drizzleWeb3Middleware,
    // websocketMiddleware,
    sagaMiddleware,
    routerMiddleware(history),
  ];

  const enhancers = [applyMiddleware(...middlewares)];

  // const store = generateStore({
  //   middlewares,
  //   appReducers: createReducer(),
  //   disableReduxDevTools: false,
  // });

  const store = createStore(
    createReducer(),
    initialState,
    composeEnhancers(...enhancers),
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {}; // Reducer registry
  store.injectedSagas = {}; // Saga registry[]
  sagaMiddleware.run(composeSagas([...drizzleSagas]));

  // console.log('zz', drizzleSagas[0]);
  // drizzleSagaMiddleware.run(drizzleSagas[0]);

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }

  return store;
}
