import { CREAM_CTOKENS_LOADED } from './constants';

export function creamCTokensLoaded(payload) {
  return {
    type: CREAM_CTOKENS_LOADED,
    payload,
  };
}
