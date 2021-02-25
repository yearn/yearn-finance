import React from 'react';
import styled from 'styled-components';
import TokenIcon from 'components/TokenIcon';

const IconAndName = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 30px;
  margin-right: 20px;
`;

const IconName = styled.div`
  overflow: hidden;
  padding-right: 10px;
  text-overflow: ellipsis;
`;

export const tokenTransform = (dontCare, asset) => {
  const { vaultAlias, address, token } = asset;
  const tokenContractAddress = token.address;
  return (
    <IconAndName>
      <StyledTokenIcon address={tokenContractAddress} />
      <IconName>{vaultAlias || address}</IconName>
    </IconAndName>
  );
};
