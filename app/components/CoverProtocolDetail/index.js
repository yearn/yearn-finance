import React, { useState } from 'react';
import styled from 'styled-components';
import CoverDetailCard from 'components/CoverDetailCard';
import { useSelector } from 'react-redux';
import { selectPoolData } from 'containers/Cover/selectors';
import { getClaimPool } from 'utils/cover';

// import CoverDetailCardSell from 'components/CoverDetailCardSell';
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

  const [amount, setAmount] = useState();
  const [equivalentTo, setEquivalentTo] = useState();
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
        <CoverDetailCard
          protocol={protocol}
          amount={amount}
          setAmount={setAmount}
          setEquivalentTo={setEquivalentTo}
          claimPool={claimPool}
        />
      </BuySellWrapper>
      <CoverTallCard
        protocol={protocol}
        amount={amount}
        equivalentTo={equivalentTo}
        claimPool={claimPool}
      />
    </Wrapper>
  );
}

CoverProtocolDetail.whyDidYouRender = true;
export default CoverProtocolDetail;
