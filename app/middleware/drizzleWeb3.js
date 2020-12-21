/*
 *
 * Inject drizzle and web3 into all actions where type starts with 'DRIZZLE'
 *
 */

import BatchCall from 'web3-batch-call';

// eslint-disable-next-line no-unused-vars
export const drizzleWeb3Middleware = drizzleWeb3 => store => next => action => {
  const { type } = action;
  if (type === 'APP_READY') {
    // eslint-disable-next-line no-param-reassign
    const provider =
      'https://eth-mainnet.alchemyapi.io/v2/XLj2FWLNMB4oOfFjbnrkuOCcaBIhipOJ';
    const batchCall = new BatchCall({
      provider,
      etherscan: {
        apiKey: 'GEQXZDY67RZ4QHNU1A57QVPNDV3RP1RYH4',
      },
      logging: true,
      simplifyResponse: false,
      store: localStorage,
    });

    // eslint-disable-next-line no-param-reassign
    drizzleWeb3 = {
      drizzle: action.drizzle,
      web3: action.web3,
      notify: action.notify,
      batchCall,
    };
  }

  const newAction = action;
  const drizzleAction =
    action.type.startsWith('DRIZZLE') ||
    action.type === 'APP_READY' ||
    action.type === 'TX_BROADCASTED' ||
    action.type === 'BATCH_CALL_REQUEST' ||
    action.type === 'INITIALIZE_CREAM' ||
    action.type === 'INITIALIZE_COVER' ||
    action.type === 'BATCH_CALL_RESPONSE';
  if (drizzleAction && drizzleWeb3) {
    newAction.drizzle = drizzleWeb3.drizzle;
    newAction.web3 = drizzleWeb3.web3;
    newAction.notify = drizzleWeb3.notify;
    newAction.batchCall = drizzleWeb3.batchCall;
  }
  return next(newAction);
};

const initializedMiddleware = drizzleWeb3Middleware(undefined);
export default initializedMiddleware;
