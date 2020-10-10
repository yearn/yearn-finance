import React from 'react';
import { ThemeProvider } from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import saga from './saga';
import reducer from './reducer';
import { lightTheme, darkTheme } from './themes';

const Theme = props => {
  useInjectSaga({ key: 'theme', saga });
  useInjectReducer({ key: 'theme', reducer });
  return <ThemeProvider theme={darkTheme}>{props.children}</ThemeProvider>;
};

export default Theme;
