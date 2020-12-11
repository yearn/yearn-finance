import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  border: 3px solid ${props => props.theme.vaultBorderActive};
  border-radius: 10px;
`;

const Top = styled.div`
  padding: 20px;
  border-radius: 10px 10px 0px 0px;
  background-color: ${props => props.theme.vaultBackground};
`;

const Middle = styled.div`
  background-color: ${props => props.theme.vaultBackgroundMiddle};
  padding: 20px;
`;

const Bottom = styled.div`
  background-color: ${props => props.theme.vaultBackground};
  border-radius: 0px 0px 10px 10px;
  padding: 20px;
`;

function BlueOutlineCard(props) {
  const { className, top, middle, bottom } = props;
  return (
    <Wrapper className={className}>
      <Top>{top}</Top>
      <Middle>{middle}</Middle>
      <Bottom>{bottom}</Bottom>
    </Wrapper>
  );
}

BlueOutlineCard.whyDidYouRender = true;
export default BlueOutlineCard;
