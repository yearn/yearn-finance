/* eslint no-param-reassign: 0 */

import produce from 'immer';
import {
  DRIZZLE_ADD_CONTRACTS,
  DELETE_CONTRACT,
} from 'containers/DrizzleProvider/constants';

const initialState = [];

const contractsReducer = (state = initialState, action) =>
  // eslint-disable-next-line no-unused-vars
  produce(state, (draft) => {
    switch (action.type) {
      case DRIZZLE_ADD_CONTRACTS: {
        const { contracts } = action;
        state.push(...contracts);
        draft = state;
        break;
      }
      case DELETE_CONTRACT: {
        const { contractName: address } = action;
        const removeAddress = (subscription) => {
          const { addresses } = subscription;
          const newAddresses = _.pull(addresses, address);
          subscription.addresses = newAddresses;
          return subscription;
        };
        const subscriptions = state;
        const newSubscriptions = _.map(subscriptions, removeAddress);
        draft = newSubscriptions;
        break;
      }
      default:
        break;
    }
  });

export default contractsReducer;
