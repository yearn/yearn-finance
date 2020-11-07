import React from 'react';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';

import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDevMode } from './actions';
import saga from './saga';
import { selectDevMode } from './selectors';
import reducer from './reducer';

const Wrapper = styled.div``;

export default function DevModeToggle() {
  useInjectSaga({ key: 'devMode', saga });
  useInjectReducer({ key: 'devMode', reducer });

  const devMode = useSelector(selectDevMode());
  const dispatch = useDispatch();
  const toggleMode = () => {
    dispatch(toggleDevMode());
  };

  return (
    <Wrapper>
      <label>
        dev mode
        <input type="checkbox" defaultChecked={devMode} onChange={toggleMode} />
      </label>
    </Wrapper>
  );
}
