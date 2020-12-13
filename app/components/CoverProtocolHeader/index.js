import React from 'react';
import styled from 'styled-components';
import SectionHeader from 'components/SectionHeader';
import BackLink from 'components/BackLink';
const Wrapper = styled.div``;
const StyledBackLink = styled(BackLink)`
  margin-top: 30px;
`;

function CoverProtocolHeader(props) {
  const { protocol } = props;
  const name = _.get(protocol, 'protocolDisplayName');

  return (
    <Wrapper>
      <SectionHeader>Buy and sell {name} cover</SectionHeader>
      <StyledBackLink to="/cover">Back to Cover</StyledBackLink>
    </Wrapper>
  );
}

CoverProtocolHeader.whyDidYouRender = true;
export default CoverProtocolHeader;
