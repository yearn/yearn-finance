import React from 'react';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import reducer from './reducer';
import saga from './saga';

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 50px 40px;
`;

const Cover = () => {
  useInjectSaga({ key: 'cream', saga });
  useInjectReducer({ key: 'cream', reducer });

  return <Wrapper>cream </Wrapper>;
};

Cover.whyDidYouRender = true;
export default Cover;
