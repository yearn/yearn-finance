import React from 'react';
import styled from 'styled-components';
// import CoverCard from 'components/CoverCard';
import { selectContracts } from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import { selectProtocols } from 'containers/Cover/selectors';
import TokenIcon from 'components/TokenIcon';
import Table from 'components/Table';

const Wrapper = styled.div``;

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

const tokenTransform = (dontCare, row) => {
  const { protocolTokenAddress, protocolDisplayName } = row;
  // const tokenContractAddress = tokenAddress || token;
  return (
    <IconAndName>
      <StyledTokenIcon address={protocolTokenAddress} />
      <IconName>{protocolDisplayName}</IconName>
    </IconAndName>
  );
};

function CoverCards() {
  const protocols = useSelector(selectProtocols());
  const claimTokens = useSelector(selectContracts('coverTokens'));
  // const [protocolsWithClaim, setProtocolsWithClaim] = useState({});

  // const renderCoverCard = (protocol, key) => {
  //   const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
  //   const claimTokenContractData = _.find(claimTokens, {
  //     address: claimAddress,
  //   });

  //   const tokenClaimState = {
  //     protocolsWithClaim,
  //     setProtocolsWithClaim,
  //   };
  //   const claimTokenBalanceOf = _.get(
  //     claimTokenContractData,
  //     'balanceOf[0].value',
  //   );
  //   return (
  //     <CoverCard
  //       tokenClaimState={tokenClaimState}
  //       protocol={protocol}
  //       key={key}
  //       claimTokenBalanceOf={claimTokenBalanceOf}
  //     />
  //   );
  // };

  const injectClaimData = (protocol) => {
    const newProtocol = protocol;
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    const claimTokenContractData = _.find(claimTokens, {
      address: claimAddress,
    });
    const claimTokenBalanceOf = _.get(
      claimTokenContractData,
      'balanceOf[0].value',
    );
    newProtocol.claimTokenBalanceOf = claimTokenBalanceOf;
    return newProtocol;
  };

  const protocolsWithClaimData = _.map(protocols, injectClaimData);

  const sortedProtocols = _.orderBy(
    protocolsWithClaimData,
    (protocol) => protocol.claimTokenBalanceOf,
    'desc',
  );

  const coverTable = {
    title: 'Buy coverage',
    columns: [
      {
        key: 'protocolDisplayName',
        alias: 'Protocol',
        transform: tokenTransform,
      },
      {
        key: 'supplied',
      },
      {
        key: 'wallet',
        alias: 'balance',
      },
      {
        key: 'apy',
      },
      {
        key: 'actions',
        alias: '',
      },
    ],
    rows: sortedProtocols,
  };

  console.log('sortt', sortedProtocols);

  // const coverCards = _.map(sortedProtocols, renderCoverCard);
  const coverCards = <Table data={coverTable} />;
  return <Wrapper>{coverCards}</Wrapper>;
}

CoverCards.whyDidYouRender = true;
export default CoverCards;
