import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import CoverCards from 'components/CoverCards';
import { fetchCoverData } from './actions';
import { selectProtocols } from './selectors';
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
  const protocols = useSelector(selectProtocols());
  const dispatch = useDispatch();

  const loadCoverData = () => {
    dispatch(fetchCoverData());
  };
  useEffect(loadCoverData, []);
  return (
    <Wrapper>
      <CoverCards protocols={protocols} />
    </Wrapper>
  );
};

Cover.whyDidYouRender = true;
export default Cover;
