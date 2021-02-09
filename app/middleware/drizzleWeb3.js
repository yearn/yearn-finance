/*
 *
 * Inject drizzle and web3 into all actions where type starts with 'DRIZZLE'
 *
 */

import BatchCall from 'web3-batch-call';

// eslint-disable-next-line no-unused-vars
export const drizzleWeb3Middleware = (drizzleWeb3) => (store) => (next) => (
  action,
) => {
  const { type } = action;
  if (type === 'APP_READY') {
    // eslint-disable-next-line no-param-reassign
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const provider = process.env.WEB3_PROVIDER_HTTPS;

    const providerKey =
      process.env.USE_LOCAL_RPC === 'TRUE'
        ? { web3: action.web3 }
        : { provider };

    const batchCall = new BatchCall({
      ...providerKey,
      etherscan: {
        apiKey,
      },
      logging: false,
      simplifyResponse: false,
      store: localStorage,
    });

    // eslint-disable-next-line no-param-reassign
    drizzleWeb3 = {
      drizzle: action.drizzle,
      web3: action.web3,
      notify: action.notify,
      localWeb3: action.localWeb3,
      batchCall,
    };
  }

  const newAction = action;
  const drizzleAction =
    action.type.startsWith('DRIZZLE') ||
    action.type === 'APP_READY' ||
    action.type === 'ACCOUNT_UPDATED' ||
    action.type === 'TX_BROADCASTED' ||
    action.type === 'BATCH_CALL_REQUEST' ||
    action.type === 'BLOCK_RECEIVED' ||
    action.type === 'INITIALIZE_CREAM' ||
    action.type === 'INITIALIZE_COVER' ||
    action.type === 'UPDATE_ETH_BALANCE' ||
    action.type === 'BATCH_CALL_RESPONSE';
  if (drizzleAction && drizzleWeb3) {
    newAction.drizzle = drizzleWeb3.drizzle;
    newAction.web3 = drizzleWeb3.web3;
    newAction.notify = drizzleWeb3.notify;
    newAction.batchCall = drizzleWeb3.batchCall;

    if (drizzleWeb3.localWeb3) {
      newAction.localWeb3 = drizzleWeb3.localWeb3;
    }
  }
  return next(newAction);
};

const initializedMiddleware = drizzleWeb3Middleware(undefined);
export default initializedMiddleware;
