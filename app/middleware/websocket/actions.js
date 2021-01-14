import * as constants from './constants';

export function websocketConnect() {
  return {
    type: constants.WEBSOCKET_CONNECT,
  };
}

export function websocketConnected(connection) {
  return {
    type: constants.WEBSOCKET_CONNECTED,
    connection,
  };
}

export function websocketMessageReceived(data) {
  return {
    type: constants.WEBSOCKET_MESSAGE_RECEIVED,
    data,
  };
}

export function websocketDisconnected() {
  return {
    type: constants.WEBSOCKET_DISCONNECTED,
  };
}
