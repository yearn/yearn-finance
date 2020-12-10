import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { fetchCoverData } from './actions';
import reducer from './reducer';
import saga from './saga';

const Wrapper = styled.div`
  width: 1088px;
  margin: 0 auto;
`;

const Cover = () => {
  useInjectSaga({ key: 'cover', saga });
  useInjectReducer({ key: 'cover', reducer });
  const dispatch = useDispatch();
  const loadCoverData = () => {
    dispatch(fetchCoverData());
  };
  useEffect(loadCoverData, []);
  return <Wrapper>doceem</Wrapper>;
};

Cover.whyDidYouRender = true;
export default Cover;
