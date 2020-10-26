import produce from 'immer';
import { GOT_CONTRACT_VAR } from 'containers/DrizzleProvider/constants';
import { VAULTS_LOADED } from './constants';

export const initialState = {};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case VAULTS_LOADED:
        draft.data = action.vaults;
        break;
      case GOT_CONTRACT_VAR: {
        const { name: address, variable: field, value } = action;
        const vault = _.find(draft.data, { address });
        vault[field] = value;
        draft.data = _.clone(draft.data);
        break;
      }
    }
  });

export default appReducer;
