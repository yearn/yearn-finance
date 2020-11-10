import produce from 'immer';
import { GOT_CONTRACT_VAR } from 'containers/DrizzleProvider/constants';

export const initialState = {
  data: [],
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = key => (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case GOT_CONTRACT_VAR: {
        const {
          name: address,
          variable: field,
          contractType,
          metadata,
          value,
        } = action;
        if (contractType !== key) {
          break;
        }
        const item = _.find(draft.data, { address });
        if (!item) {
          const newItem = { address };
          draft.data.push(newItem);
          newItem[field] = _.clone(value);
          newItem.metadata = metadata;
          break;
        }
        item[field] = value;
        item.metadata = metadata;
        draft.data = _.clone(draft.data);
        break;
      }
    }
  });

export default appReducer;
