import React from 'react';
import styled from 'styled-components';
import CoverProtocolHeader from 'components/CoverProtocolHeader';
import CoverProtocolDetail from 'components/CoverProtocolDetail';

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: 30px auto;
`;

function CoverProtocol() {
  return (
    <Wrapper>
      <CoverProtocolHeader />
      <CoverProtocolDetail />
    </Wrapper>
  );
}

CoverProtocol.whyDidYouRender = true;
export default CoverProtocol;
