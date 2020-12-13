import React from 'react';
import styled from 'styled-components';
import CoverDetailCard from 'components/CoverDetailCard';
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
  return (
    <Wrapper>
      <BuySellWrapper>
        <CoverDetailCard protocol={protocol} />
      </BuySellWrapper>
      <CoverTallCard protocol={protocol} />
    </Wrapper>
  );
}

CoverProtocolDetail.whyDidYouRender = true;
export default CoverProtocolDetail;
