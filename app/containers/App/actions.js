import * as c from './constants';

export function vaultsLoaded(vaults) {
  return {
    type: c.VAULTS_LOADED,
    vaults,
  };
}

export function appReady(web3, drizzle, notify) {
  return {
    type: c.APP_READY,
    web3,
    drizzle,
    notify,
  };
}

export function appInitialized() {
  return {
    type: c.APP_INITIALIZED,
  };
}
