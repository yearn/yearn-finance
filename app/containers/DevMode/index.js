import React from 'react';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';

import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { toggleDevMode } from './actions';
import saga from './saga';
import reducer from './reducer';

const Wrapper = styled.div`
  display: ${(props) => (props.devModeUnlocked ? 'inherit' : 'none')};
  position: absolute;
  z-index: 5;
  top: 60px;
`;

export default function DevModeToggle() {
  useInjectSaga({ key: 'devMode', saga });
  useInjectReducer({ key: 'devMode', reducer });

  const devMode = true;
  const devModeUnlocked = true;
  const dispatch = useDispatch();
  const toggleMode = () => {
    dispatch(toggleDevMode());
  };

  return (
    <Wrapper devModeUnlocked={devModeUnlocked}>
      <label>
        dev mode
        <input type="checkbox" checked={devMode} onChange={toggleMode} />
      </label>
    </Wrapper>
  );
}
