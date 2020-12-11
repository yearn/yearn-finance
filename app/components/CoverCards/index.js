import React, { useState } from 'react';
import styled from 'styled-components';
import CoverCard from 'components/CoverCard';
import { selectContracts } from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import { selectProtocols } from 'containers/Cover/selectors';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 330px);
  grid-gap: 45px;
  justify-content: center;
`;

function CoverCards() {
  const protocols = useSelector(selectProtocols());
  const claimTokens = useSelector(selectContracts('coverTokens'));
  const [protocolsWithClaim, setProtocolsWithClaim] = useState({});

  const renderCoverCard = (protocol, key) => {
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    const claimTokenContractData = _.find(claimTokens, {
      address: claimAddress,
    });

    const tokenClaimState = {
      protocolsWithClaim,
      setProtocolsWithClaim,
    };

    const claimTokenBalanceOf = _.get(claimTokenContractData, 'balanceOf');
    return (
      <CoverCard
        tokenClaimState={tokenClaimState}
        protocol={protocol}
        key={key}
        claimTokenBalanceOf={claimTokenBalanceOf}
      />
    );
  };

  const injectClaimData = protocol => {
    const newProtocol = protocol;
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    const claimTokenContractData = _.find(claimTokens, {
      address: claimAddress,
    });
    const claimTokenBalanceOf = _.get(claimTokenContractData, 'balanceOf');
    newProtocol.claimTokenBalanceOf = claimTokenBalanceOf;
    return newProtocol;
  };

  const protocolsWithClaimData = _.map(protocols, injectClaimData);

  const sortedProtocols = _.orderBy(
    protocolsWithClaimData,
    protocol => protocol.claimTokenBalanceOf,
    'desc',
  );

  const coverCards = _.map(sortedProtocols, renderCoverCard);
  return <Wrapper>{coverCards}</Wrapper>;
}

CoverCards.whyDidYouRender = true;
export default CoverCards;
