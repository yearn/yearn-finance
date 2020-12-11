import React from 'react';
import styled from 'styled-components';
const Wrapper = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-size: 36px;
  line-height: 40px;
  color: #ffffff;
`;

function SectionHeader(props) {
  const { children } = props;
  return <Wrapper>{children}</Wrapper>;
}

SectionHeader.whyDidYouRender = true;
export default SectionHeader;
