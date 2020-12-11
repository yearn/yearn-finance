import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
const Wrapper = styled.div``;

function CoverProtocol() {
  return (
    <Wrapper>
      <Link to="/cover">Back</Link>
    </Wrapper>
  );
}

CoverProtocol.whyDidYouRender = true;
export default CoverProtocol;
