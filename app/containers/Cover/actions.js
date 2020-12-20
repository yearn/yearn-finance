import { COVER_DATA_LOADED, INITIALIZE_COVER } from './constants';

export function initializeCover() {
  return {
    type: INITIALIZE_COVER,
  };
}

export function coverDataLoaded(payload) {
  return {
    type: COVER_DATA_LOADED,
    payload,
  };
}
