import { COVER_DATA_LOADED, COVER_DATA_FETCH } from './constants';

export function fetchCoverData() {
  return {
    type: COVER_DATA_FETCH,
  };
}

export function coverDataLoaded(payload) {
  return {
    type: COVER_DATA_LOADED,
    payload,
  };
}
