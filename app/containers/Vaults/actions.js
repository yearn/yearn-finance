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

export function withdrawAllFromVault(payload) {
  return {
    type: c.WITHDRAW_ALL_FROM_VAULT,
    payload,
  };
}

export function depositToVault(payload) {
  return {
    type: c.DEPOSIT_TO_VAULT,
    payload,
  };
}

export function zapPickle(payload) {
  return {
    type: c.ZAP_PICKLE,
    payload,
  };
}

export function depositPickleSLPInFarm(payload) {
  return {
    type: c.DEPOSIT_PICKLE_SLP_IN_FARM,
    payload,
  };
}

export function restakeBackscratcherRewards(payload) {
  return {
    type: c.RESTAKE_BACKSCRATCHER_REWARDS,
    payload,
  };
}

export function claimBackscratcherRewards(payload) {
  return {
    type: c.CLAIM_BACKSCRATCHER_REWARDS,
    payload,
  };
}

export function migrateVault(payload) {
  return {
    type: c.MIGRATE_VAULT,
    payload,
  };
}

export function exitOldPickleGauge(payload) {
  return {
    type: c.EXIT_OLD_PICKLE,
    payload,
  };
}
