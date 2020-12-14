import React, { useRef } from 'react';
import styled from 'styled-components';
import BlueOutlineCard from 'components/BlueOutlineCard';
import TokenIcon from 'components/TokenIcon';
import Icon from 'components/Icon';
import RoundedInput from 'components/RoundedInput';
import ButtonFilled from 'components/ButtonFilled';
import { calculateAmountOutFromSell } from 'utils/cover';

const StyledTokenIcon = styled(TokenIcon)`
  width: 32px;
  min-width: 32px;
  min-height: 32px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
`;

const Middle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MiddleHeader = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-size: 18px;
  line-height: 26px;
  margin-bottom: 13px;
  color: #ffffff;
`;

const MiddleContent = styled.div`
  width: 553px;
  margin: 0 auto;
`;
const MiddleDivider = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 13px;
`;

const MiddleText = styled.div`
  font-family: 'Roboto Light';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
  color: #ffffff;
  margin-bottom: 25px;
`;
const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0px 20px;
`;

const BuyHeader = styled.div`
  margin-top: 13px;
  margin-left: 16px;
`;

const StyledBlueOutlineCard = styled(BlueOutlineCard)`
  width: 750px;
  margin-top: 50px;
`;

const BottomLeft = styled.div`
  display: flex;
  width: 330px;
  flex-direction: column;
`;

const BottomLeftTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BottomLeftBottom = styled.div`
  margin-top: 10px;
`;

const Max = styled.div`
  font-family: 'Roboto Medium';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.529412px;
  color: #000000;
  opacity: 0.4;
  margin-right: 5px;
`;

const MaxWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const InputTextRight = styled.div`
  font-family: 'Roboto Medium';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.529412px;
  color: #000000;
`;

const BottomRight = styled.div`
  width: 288px;
  display: flex;
  flex-direction: column;
`;

const AmountText = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: bold;
  font-size: 21px;
  line-height: 25px;
  letter-spacing: 0.5px;
  color: #ffffff;
`;

const BalanceText = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.529412px;
  color: #ffffff;
`;

const EquivalentText = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.529412px;
  color: #ffffff;
`;

const SummaryText = styled.div`
  font-family: 'Roboto Light';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.529412px;
  color: #ffffff;
  margin-top: 10px;
`;

const InfoIcon = styled(Icon)`
  margin-left: 3px;
  top: 2px;
  position: relative;
`;

const ArrowDown = styled(Icon)``;

const ArrowWrapper = styled.div`
  position: absolute;
  width: 100%;
  top: 0;
  display: flex;
  justify-content: center;
`;

const EquivalentWrapper = styled.div`
  position: relative;
  margin: 15px 0px;
`;

const SmallTokenIcon = styled(TokenIcon)`
  width: 24px;
  padding: 0px 7px;
`;

const BottomInputWrapper = styled.div`
  margin-bottom: 70px;
`;

const ButtonWrapper = styled.div`
  width: 154px;
  height: 100%;
  display: flex;
  align-items: end;
  align-self: end;
`;

function CoverDetailCardSell(props) {
  const { className, protocol, setAmount, claimPool } = props;
  const protocolDisplayName = _.get(protocol, 'protocolDisplayName');
  const protocolName = _.get(protocol, 'protocolName');
  const protocolTokenAddress = _.get(protocol, 'protocolTokenAddress');
  const claimNonce = _.get(protocol, 'claimNonce');
  const collateralName = _.get(
    protocol,
    `coverObjects.${claimNonce}.collateralName`,
  );
  const collateralAddress = _.get(
    protocol,
    `coverObjects.${claimNonce}.collateralAddress`,
  );

  const equivalentToRef = useRef(null);

  const updateAmount = evt => {
    const newAmount = evt.target.value;
    setAmount(newAmount);

    // TODO: Placeholder for Alan
    console.log('claim pool', claimPool);
    const covTokenSellAmt = newAmount;
    const covTokenInPool = 0;
    const outAssetWeight = 0;
    const feePercent = 0;
    const covTokenPrice = 0;

    const sellEquivalent = calculateAmountOutFromSell(
      covTokenSellAmt,
      covTokenInPool,
      outAssetWeight,
      feePercent,
      covTokenPrice,
    );

    equivalentToRef.current.value = sellEquivalent;
  };

  const claimInputTop = (
    <InputTextRight>
      <MaxWrapper>
        <Max>Max</Max>
        <div>claim tokens</div>
      </MaxWrapper>
    </InputTextRight>
  );

  const claimInputBottom = (
    <InputTextRight>
      <MaxWrapper>
        <SmallTokenIcon address={collateralAddress} />
        <InputTextRight>{collateralName}</InputTextRight>
      </MaxWrapper>
    </InputTextRight>
  );

  const top = (
    <Top>
      <StyledTokenIcon address={protocolTokenAddress} />
      <BuyHeader>Sell your {protocolDisplayName} cover</BuyHeader>
    </Top>
  );
  const middle = (
    <Middle>
      <MiddleContent>
        <MiddleHeader>
          Selling your {protocolDisplayName} claim tokens
        </MiddleHeader>
        <MiddleDivider />
        <MiddleText>
          In the case that you don’t want to be covered for your{' '}
          {protocolDisplayName}
          position anymore you can use this panel to sell your {
            protocolName
          }{' '}
          claim tokens.
        </MiddleText>
      </MiddleContent>
    </Middle>
  );
  const bottom = (
    <Bottom>
      <BottomLeft>
        <BottomLeftTop>
          <AmountText>
            Amount <InfoIcon type="info" />
          </AmountText>
          <BalanceText>Your balance: 4349</BalanceText>
        </BottomLeftTop>
        <BottomLeftBottom>
          <RoundedInput onChange={updateAmount} right={claimInputTop} />
          <EquivalentWrapper>
            <EquivalentText>Sell price:</EquivalentText>
            <ArrowWrapper>
              <ArrowDown type="arrowDown" />
            </ArrowWrapper>
          </EquivalentWrapper>
          <BottomInputWrapper>
            <RoundedInput ref={equivalentToRef} right={claimInputBottom} />
          </BottomInputWrapper>
        </BottomLeftBottom>
      </BottomLeft>
      <BottomRight>
        <AmountText>Summary</AmountText>
        <SummaryText>
          You will sell 4959 {collateralName} claim tokens and will get back 500{' '}
          {collateralName}. 
        </SummaryText>
        <ButtonWrapper>
          <ButtonFilled variant="contained" color="primary">
            Approve
          </ButtonFilled>
        </ButtonWrapper>
      </BottomRight>
    </Bottom>
  );
  return (
    <StyledBlueOutlineCard className={className}>
      {top}
      {middle}
      {bottom}
    </StyledBlueOutlineCard>
  );
}

CoverDetailCardSell.whyDidYouRender = false;
export default CoverDetailCardSell;
