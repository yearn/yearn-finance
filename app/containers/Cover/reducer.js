import produce from 'immer';
import { COVER_DATA_LOADED } from './constants';

export const initialState = {};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    const assignData = (val, key) => {
      draft[key] = val;
    };
    switch (action.type) {
      case COVER_DATA_LOADED: {
        const coverData = action.payload;
        _.each(coverData, assignData);
        break;
      }
    }
  });

export default appReducer;
