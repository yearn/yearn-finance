import {
  INIT_ZAPPER,
  ZAPPER_DATA_LOADED,
  ZAP_IN,
  ZAP_IN_ERROR,
  ZAP_OUT_ERROR,
  ZAP_OUT_APPROVE,
  ZAP_OUT_WITHDRAW,
  ZAP_OUT_ALLOWANCE,
  MIGRATE_PICKLE_GAUGE,
} from './constants';

export function initializeZapper() {
  return {
    type: INIT_ZAPPER,
  };
}

export function zapperDataLoaded(payload) {
  return {
    type: ZAPPER_DATA_LOADED,
    payload,
  };
}

export function zapIn(payload) {
  return {
    type: ZAP_IN,
    payload,
  };
}

export function zapOutApprove(payload) {
  return {
    type: ZAP_OUT_APPROVE,
    payload,
  };
}

export function zapOutWithdraw(payload) {
  return {
    type: ZAP_OUT_WITHDRAW,
    payload,
  };
}

export function zapInError(payload) {
  return {
    type: ZAP_IN_ERROR,
    payload,
  };
}

export function zapOutError(payload) {
  return {
    type: ZAP_OUT_ERROR,
    payload,
  };
}

export function zapOutAllowance(payload) {
  return {
    type: ZAP_OUT_ALLOWANCE,
    payload,
  };
}

export function migratePickleGauge(payload) {
  return {
    type: MIGRATE_PICKLE_GAUGE,
    payload,
  };
}
