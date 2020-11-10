import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from './actions';
import { selectDarkMode } from './selectors';

const Wrapper = styled.div``;

export default function ConnectButton() {
  const darkMode = useSelector(selectDarkMode());
  const dispatch = useDispatch();
  const toggleMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <Wrapper>
      <label>
        dark mode
        <input type="checkbox" checked={darkMode} onChange={toggleMode} />
      </label>
    </Wrapper>
  );
}
