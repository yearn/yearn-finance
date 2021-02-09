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

export function withdrawFromVault(payload) {
  return {
    type: c.WITHDRAW_FROM_VAULT,
    payload,
  };
}

export function depositToVault(payload) {
  return {
    type: c.DEPOSIT_TO_VAULT,
    payload,
  };
}

export function claimBackscratcherRewards(payload) {
  return {
    type: c.CLAIM_BACKSCRATCHER_REWARDS,
    payload,
  };
}
