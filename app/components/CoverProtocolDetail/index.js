import React, { useState } from 'react';
import styled from 'styled-components';
import CoverDetailCardBuy from 'components/CoverDetailCardBuy';
import CoverDetailCardSell from 'components/CoverDetailCardSell';
import { useSelector } from 'react-redux';
import { selectPoolData } from 'containers/Cover/selectors';
import { getClaimPool } from 'utils/cover';
import CoverTallCard from 'components/CoverTallCard';
const Wrapper = styled.div`
  margin-top: 30px;
  display: flex;
`;

const BuySellWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

function CoverProtocolDetail(props) {
  const { protocol } = props;

  const [buyAmount, setBuyAmount] = useState();
  const [sellAmount, setSellAmount] = useState();
  const [buyEquivalentTo, setBuyEquivalentTo] = useState();
  const poolData = useSelector(selectPoolData());
  const claimNonce = _.get(protocol, 'claimNonce');
  const claimAddress = _.get(
    protocol,
    `coverObjects.${claimNonce}.tokens.claimAddress`,
  );

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
          setEquivalentTo={setBuyEquivalentTo}
          claimPool={claimPool}
        />
        <CoverDetailCardSell
          protocol={protocol}
          amount={sellAmount}
          setAmount={setSellAmount}
          claimPool={claimPool}
        />
      </BuySellWrapper>
      <CoverTallCard
        protocol={protocol}
        amount={buyAmount}
        equivalentTo={buyEquivalentTo}
        claimPool={claimPool}
      />
    </Wrapper>
  );
}

CoverProtocolDetail.whyDidYouRender = true;
export default CoverProtocolDetail;
