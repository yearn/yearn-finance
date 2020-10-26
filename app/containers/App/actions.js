import * as c from './constants';

export function vaultsLoaded(vaults) {
  return {
    type: c.VAULTS_LOADED,
    vaults,
  };
}

export function appReady(web3, drizzle) {
  return {
    type: c.APP_READY,
    web3,
    drizzle,
  };
}
