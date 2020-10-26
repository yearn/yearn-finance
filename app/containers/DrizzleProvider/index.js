import React from 'react';
import { Drizzle } from 'drizzle/store';
import { useInjectSaga } from 'utils/injectSaga';
import DrizzleContext from './context';
import saga from './saga';
const DrizzleProvider = props => {
  useInjectSaga({ key: 'drizzleSaga', saga });
  const { children, store } = props;
  const options = {
    disableReduxDevTools: false,
  };
  const drizzle = new Drizzle(options, store);
  return (
    <DrizzleContext.Provider value={{ drizzle }}>
      {children}
    </DrizzleContext.Provider>
  );
};

export default DrizzleProvider;
