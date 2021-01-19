/* eslint-disable max-nested-callbacks */
import * as constants from './constants';
import WebsocketConnection from './connection';

const socketMiddleware = (() => {
  let websocketConnection = null;

  return (store) => (next) => (action) => {
    switch (action.type) {
      case constants.WEBSOCKET_CONNECT:
        if (websocketConnection != null) {
          websocketConnection.close();
        }
        websocketConnection = new WebsocketConnection(store.dispatch);
        break;
      default:
    }
    const newAction = action;
    if (action.type === 'DRIZZLE_ADD_CONTRACTS') {
      newAction.websocket = websocketConnection;
    }
    return next(newAction);
  };
})();

export default socketMiddleware;
