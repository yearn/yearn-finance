import React from 'react';
import { Drizzle } from 'drizzle/store';
import DrizzleContext from './context';

const DrizzleProvider = props => {
  const { children, store } = props;

  const options = {
    disableReduxDevTools: false,
  };

  const drizzle = new Drizzle(options, store);
  return (
    <DrizzleContext.Provider value={drizzle}>
      {children}
    </DrizzleContext.Provider>
  );
};

export default DrizzleProvider;
