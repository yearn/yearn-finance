/* eslint no-param-reassign: 0 */

import produce from 'immer';
// import { DRIZZLE_ADD_CONTRACTS } from 'containers/DrizzleProvider/constants';

// import { generateContractInitialState } from '../contractStateUtils';
// import * as EventActions from './constants';

const initialState = {};

const contractsReducer = (state = initialState, action) =>
  // eslint-disable-next-line no-unused-vars
  produce(state, draft => {
    switch (action.type) {
      case 'BATCH_CALL_RESPONSE': {
        const { payload: contracts } = action;

        const mergeContractState = contractState => {
          const { address } = contractState;
          const addressState = state[address];
          const addressInitialized = !!addressState;
          if (!addressInitialized) {
            draft[address] = {};
          }
          const mergeState = (val, key) => {
            const existingState = _.get(state, `${address}.${key}`, []);
            const valIsNotArray = !_.isArray(val);
            if (valIsNotArray) {
              draft[address][key] = val;
            } else {
              const newState = existingState;

              const addIfInputUnique = item => {
                const { input } = item;
                const matchingInput = _.find(existingState, { input });
                if (!input || !matchingInput) {
                  newState.push(item);
                } else if (matchingInput) {
                  matchingInput.value = item.value;
                } else {
                  console.log('Error in contracts reducer'); // Should not be able to get here
                }
              };
              _.each(val, addIfInputUnique);
              draft[address][key] = newState;
            }
          };
          _.each(contractState, mergeState);
        };
        _.each(contracts, mergeContractState);
        break;
      }
      case 'DELETE_CONTRACT': {
        const { contractName: address } = action;
        delete draft[address];
        break;
      }

      default:
        break;
    }
  });

export default contractsReducer;
