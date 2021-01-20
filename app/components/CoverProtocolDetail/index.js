import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import CoverDetailCardBuy from 'components/CoverDetailCardBuy';
import CoverDetailCardSell from 'components/CoverDetailCardSell';
import { useSelector } from 'react-redux';
import { selectContractData } from 'containers/App/selectors';
import { selectPoolData } from 'containers/Cover/selectors';
import { getClaimPool } from 'utils/cover';
import CoverTallCard from 'components/CoverTallCard';
import BigNumber from 'bignumber.js';

const Wrapper = tw.div`flex flex-col md:flex-row mt-8`;

const BuySellWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

function CoverProtocolDetail(props) {
  const { protocol } = props;

  const [buyAmount, setBuyAmount] = useState();
  const [sellAmount, setSellAmount] = useState();
  const [buyEquivalentTo, setBuyEquivalentTo] = useState();
  const [sellEquivalentTo, setSellEquivalentTo] = useState();
  const poolData = useSelector(selectPoolData());
  const claimNonce = _.get(protocol, 'claimNonce');
  const claimAddress = _.get(
    protocol,
    `coverObjects.${claimNonce}.tokens.claimAddress`,
  );

  const claimTokenContractData = useSelector(selectContractData(claimAddress));
  const claimTokenBalanceOf = _.get(claimTokenContractData, 'balanceOf');
  const claimTokenBalanceOfNormalized = new BigNumber(claimTokenBalanceOf)
    .dividedBy(10 ** 18)
    .toFixed(5);

  if (!(poolData && claimAddress)) {
    return <div />;
  }
  const claimPool = getClaimPool(poolData, claimAddress);

  return (
    <Wrapper>
      <BuySellWrapper>
        <CoverDetailCardBuy
          protocol={protocol}
          amount={buyAmount}
          setAmount={setBuyAmount}
          equivalentTo={buyEquivalentTo}
          setEquivalentTo={setBuyEquivalentTo}
          claimPool={claimPool}
        />
        <CoverDetailCardSell
          protocol={protocol}
          amount={sellAmount}
          setAmount={setSellAmount}
          setEquivalentTo={setSellEquivalentTo}
          claimPool={claimPool}
          claimTokenBalanceOf={claimTokenBalanceOf}
          claimTokenBalanceOfNormalized={claimTokenBalanceOfNormalized}
        />
      </BuySellWrapper>
      <CoverTallCard
        protocol={protocol}
        buyAmount={buyAmount}
        buyEquivalentTo={buyEquivalentTo}
        sellAmount={sellAmount}
        sellEquivalentTo={sellEquivalentTo}
        claimPool={claimPool}
        claimTokenBalanceOf={claimTokenBalanceOf}
        claimTokenBalanceOfNormalized={claimTokenBalanceOfNormalized}
      />
    </Wrapper>
  );
}

CoverProtocolDetail.whyDidYouRender = false;
export default CoverProtocolDetail;
