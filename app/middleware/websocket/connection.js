/* eslint-disable max-depth */
import {
  websocketMessageReceived,
  websocketConnected,
} from 'middleware/websocket/actions';

const connectionUrl = 'wss://stream.firehose.finance';

class websocketConnection {
  constructor(dispatch) {
    this.dispatch = dispatch;
    this.connection = new WebSocket(connectionUrl);
    this.connection.onopen = this.onOpen;
    this.connection.onclose = this.onClose;
    this.connection.onerror = this.onError;
    this.connection.onmessage = this.onMessage;
    this.ready = false;
  }

  onError = (err) => {
    console.log('Websocket error', err);
  };

  onClose = (evt) => {
    console.log('Websocket closed', evt);
  };

  onOpen = () => {
    this.dispatch(websocketConnected());
    // this.connection.send(
    //   JSON.stringify({
    //     action: 'subscribe',
    //     topic: 'protocol',
    //     subject: 'yearn',
    //   }),
    // );
    this.send = this.connection.send;
    // this.connection.send('ping');
    setInterval(() => {
      // this.connection.send('ping');
    }, 30000);
  };

  onMessage = (message) => {
    const { data } = message;
    const parsedData = JSON.parse(data);
    this.dispatch(websocketMessageReceived(parsedData));
  };

  close = () => {
    this.connection.close();
  };
}

export default websocketConnection;
