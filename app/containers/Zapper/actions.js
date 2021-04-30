import {
  INIT_ZAPPER,
  ZAPPER_DATA_LOADED,
  ZAP_IN,
  ZAP_IN_ERROR,
  ZAP_OUT_ERROR,
  ZAP_OUT,
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

export function zapOut(payload) {
  return {
    type: ZAP_OUT,
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

export function migratePickleGauge(payload) {
  return {
    type: MIGRATE_PICKLE_GAUGE,
    payload,
  };
}
