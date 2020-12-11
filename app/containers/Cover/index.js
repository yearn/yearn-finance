import React from 'react';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import CoverCards from 'components/CoverCards';
import CoverProtocol from 'components/CoverProtocol';
import { Switch, Route } from 'react-router-dom';
import reducer from './reducer';
import saga from './saga';

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1080px;
  padding: 100px 40px;
`;

const Cover = () => {
  useInjectSaga({ key: 'cover', saga });
  useInjectReducer({ key: 'cover', reducer });

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
