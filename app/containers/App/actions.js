import * as c from './constants';

export function vaultsLoaded(vaults) {
  return {
    type: c.VAULTS_LOADED,
    vaults,
  };
}

export function appReady() {
  return {
    type: c.APP_READY,
  };
}
