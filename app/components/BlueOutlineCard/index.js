import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  border: 3px solid ${(props) => props.theme.vaultBorderActive};
  border-radius: 10px;
  > div:nth-of-type(1) {
    padding: 20px;
    border-radius: 10px 10px 0px 0px;
    background-color: ${(props) => props.theme.vaultBackground};
  }
  > div:nth-of-type(2) {
    background-color: ${(props) => props.theme.vaultBackgroundMiddle};
    padding: 20px;
  }
  > div:nth-of-type(3) {
    background-color: ${(props) => props.theme.vaultBackground};
    border-radius: 0px 0px 10px 10px;
    padding: 20px;
  }
`;

function BlueOutlineCard(props) {
  const { className, children } = props;
  return <Wrapper className={className}>{children}</Wrapper>;
}

BlueOutlineCard.whyDidYouRender = false;
export default BlueOutlineCard;
