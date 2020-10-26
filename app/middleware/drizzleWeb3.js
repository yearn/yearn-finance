/*
 *
 * Inject drizzle and web3 into all actions where type starts with 'DRIZZLE'
 *
 */

// eslint-disable-next-line no-unused-vars
export const drizzleWeb3Middleware = drizzleWeb3 => store => next => action => {
  const { type } = action;
  if (type === 'APP_READY') {
    // eslint-disable-next-line no-param-reassign
    drizzleWeb3 = {
      drizzle: action.drizzle,
      web3: action.web3,
    };
  }

  const newAction = action;
  const drizzleAction = action.type.startsWith('DRIZZLE');
  if (drizzleAction && drizzleWeb3) {
    newAction.drizzle = drizzleWeb3.drizzle;
    newAction.web3 = drizzleWeb3.web3;
  }
  return next(newAction);
};

const initializedMiddleware = drizzleWeb3Middleware(undefined);
export default initializedMiddleware;
