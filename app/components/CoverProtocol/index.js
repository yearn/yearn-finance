import React from 'react';
import styled from 'styled-components';
import CoverProtocolHeader from 'components/CoverProtocolHeader';
import CoverProtocolDetail from 'components/CoverProtocolDetail';
import { useSelector } from 'react-redux';
import { selectProtocols } from 'containers/Cover/selectors';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

function CoverProtocol(props) {
  const { protocolAddress } = props.match.params;

  const protocols = useSelector(selectProtocols());
  const protocol = _.find(protocols, { protocolAddress });
  return (
    <Wrapper>
      <CoverProtocolHeader protocol={protocol} />
      <CoverProtocolDetail protocol={protocol} />
    </Wrapper>
  );
}

CoverProtocol.whyDidYouRender = true;
export default CoverProtocol;
