import React from 'react';
import { ThemeProvider } from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { useSelector } from 'react-redux';
import saga from './saga';
import reducer from './reducer';
import { lightTheme, darkTheme } from './themes';
import { selectDarkMode } from './selectors';

const Theme = (props) => {
  useInjectSaga({ key: 'theme', saga });
  useInjectReducer({ key: 'theme', reducer });
  const darkMode = useSelector(selectDarkMode());
  const theme = darkMode ? darkTheme : lightTheme;
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};

export default Theme;
