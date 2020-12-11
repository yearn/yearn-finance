import { COVER_DATA_LOADED } from './constants';

export function coverDataLoaded(payload) {
  return {
    type: COVER_DATA_LOADED,
    payload,
  };
}
