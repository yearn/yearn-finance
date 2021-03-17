import {
  INIT_ZAPPER,
  ZAPPER_DATA_LOADED,
  ZAP_IN,
  ZAP_IN_ERROR,
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

export function zapInError(payload) {
  return {
    type: ZAP_IN_ERROR,
    payload,
  };
}
