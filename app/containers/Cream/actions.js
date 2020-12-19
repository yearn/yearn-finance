/**
 * Placeholders for API data loading
 */
// import { CREAM_DATA_LOADED } from './constants';
// export function creamDataLoaded(payload) {
//   return {
//     type: CREAM_DATA_LOADED,
//     payload,
//   };
// }

import { INITIALIZE_CREAM } from './constants';

export function initializeCream() {
  return {
    type: INITIALIZE_CREAM,
  };
}
