import React, { useState } from 'react';
import styled from 'styled-components';
import CoverCard from 'components/CoverCard';
import { selectAllContracts } from 'containers/App/selectors';
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
  const claimTokens = useSelector(selectAllContracts());
  const [protocolsWithClaim, setProtocolsWithClaim] = useState({});

  const renderCoverCard = (protocol, key) => {
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    const currentTime = Date.now() / 1000;
    const expirationTimestamp =
      protocol.expirationTimestamps[protocol.claimNonce];
    const claimTokenContractData = _.find(
      claimTokens,
      (val, claimKey) => claimKey === claimAddress,
    );

    const tokenClaimState = {
      protocolsWithClaim,
      setProtocolsWithClaim,
    };
    const claimTokenBalanceOf =
      _.get(claimTokenContractData, 'balanceOf[0].value') || '0';

    return (
      expirationTimestamp > currentTime && (
        <CoverCard
          tokenClaimState={tokenClaimState}
          protocol={protocol}
          key={key}
          claimTokenBalanceOf={claimTokenBalanceOf}
        />
      )
    );
  };

  const injectClaimData = (protocol) => {
    const newProtocol = protocol;
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    const claimTokenContractData = _.find(claimTokens, {
      address: claimAddress,
    });
    const claimTokenBalanceOf =
      _.get(claimTokenContractData, 'balanceOf[0].value') || '0';
    newProtocol.claimTokenBalanceOf = claimTokenBalanceOf;
    return newProtocol;
  };

  const filteredProtocols = _.filter(protocols, (protocol) => {
    const claimAddress = _.get(
      protocol,
      `coverObjects[${protocol.claimNonce}].tokens`,
    );
    return claimAddress && protocol.protocolDisplayName;
  });

  const protocolsWithClaimData = _.map(filteredProtocols, injectClaimData);

  const sortedProtocols = _.orderBy(
    protocolsWithClaimData,
    (protocol) => protocol.claimTokenBalanceOf,
    'desc',
  );

  const coverCards = _.map(sortedProtocols, renderCoverCard);
  return <Wrapper>{coverCards}</Wrapper>;
}

CoverCards.whyDidYouRender = true;
export default CoverCards;
