import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import CoverCards from 'components/CoverCards';
import CoverProtocol from 'components/CoverProtocol';
import { Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initializeCover } from './actions';
import reducer from './reducer';
import saga from './saga';

const Wrapper = styled.div`
  width: 100%;
  padding: 50px 20px;
  @media (min-width: 768px) {
    padding: 50px 40px;
  }
`;

const Cover = () => {
  const dispatch = useDispatch();
  useInjectSaga({ key: 'cover', saga });
  useInjectReducer({ key: 'cover', reducer });

  useEffect(() => {
    dispatch(initializeCover());
  }, []);
  return (
    <Wrapper>
      <Switch>
        <Route exact path="/cover" component={CoverCards} />
        <Route path="/cover/:protocolAddress" component={CoverProtocol} />
      </Switch>
    </Wrapper>
  );
};

Cover.whyDidYouRender = true;
export default Cover;
