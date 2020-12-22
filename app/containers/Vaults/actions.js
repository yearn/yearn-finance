import * as c from './constants';

export function userVaultStatisticsLoaded(vaults) {
  return {
    type: c.USER_VAULT_STATISTICS_LOADED,
    vaults,
  };
}

export function vaultsLoaded(vaults) {
  return {
    type: c.VAULTS_LOADED,
    vaults,
  };
}
