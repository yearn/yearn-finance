import React from 'react';
import { ThemeProvider } from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import saga from './saga';
import { lightTheme, darkTheme } from './themes';

const Theme = props => {
  useInjectSaga({ key: 'themeSaga', saga });
  return <ThemeProvider theme={darkTheme}>{props.children}</ThemeProvider>;
};

export default Theme;
