/* eslint no-param-reassign: 0 */

import produce from 'immer';
import { DRIZZLE_ADD_CONTRACTS } from 'containers/DrizzleProvider/constants';

const initialState = [];

const contractsReducer = (state = initialState, action) =>
  // eslint-disable-next-line no-unused-vars
  produce(state, draft => {
    switch (action.type) {
      case DRIZZLE_ADD_CONTRACTS: {
        const { contracts } = action;
        state.push(...contracts);
        draft = state;
        break;
      }
      default:
        break;
    }
  });

export default contractsReducer;
