import React from 'react';
import styled from 'styled-components';
import BlueOutlineCard from 'components/BlueOutlineCard';
import TokenIcon from 'components/TokenIcon';
import Icon from 'components/Icon';
import RoundedInput from 'components/RoundedInput';
import ButtonFilled from 'components/ButtonFilled';
import { selectContractData } from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';

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

const FullDocumentation = styled.a`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.529412px;
  display: flex;
  align-items: center;
  color: #ffffff;
  text-decoration: none;
  margin-bottom: 40px;
`;

const StyledIcon = styled(Icon)`
  margin-right: 5px;
`;

const StyledBlueOutlineCard = styled(BlueOutlineCard)`
  width: 750px;
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

function CoverDetailCard(props) {
  const { className, protocol } = props;
  const protocolDisplayName = _.get(protocol, 'protocolDisplayName');
  const protocolName = _.get(protocol, 'protocolName');
  const protocolTokenAddress = _.get(protocol, 'protocolTokenAddress');
  const claimNonce = _.get(protocol, 'claimNonce');

  const collateralName = _.get(
    protocol,
    `coverObjects.${claimNonce}.collateralName`,
  );
  const expirationTimestamp =
    _.get(protocol, `coverObjects.${claimNonce}.expirationTimestamp`) * 1000;

  const expirationDateTime = new Date(expirationTimestamp);

  const dateTime = expirationDateTime.toLocaleString('en', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });

  // const collateralAddress = _.get(
  //   protocol,
  //   `coverObjects.${claimNonce}.collateralAddress`,
  // );

  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const daiData = useSelector(selectContractData(daiAddress));
  let daiBalanceOf = new BigNumber(daiData.balanceOf)
    .dividedBy(10 ** 18)
    .toFixed(2);
  if (Number.isNaN(daiBalanceOf)) {
    daiBalanceOf = '...';
  }

  const claimInputBottom = (
    <React.Fragment>
      <SmallTokenIcon address={daiAddress} />
      <InputTextRight>DAI</InputTextRight>
    </React.Fragment>
  );

  const claimInputTop = (
    <InputTextRight>
      <MaxWrapper>
        <Max>Max</Max>
        <div>claim tokens</div>
      </MaxWrapper>
    </InputTextRight>
  );

  const top = (
    <Top>
      <StyledTokenIcon address={protocolTokenAddress} />
      <BuyHeader>Buy cover for {protocolDisplayName}</BuyHeader>
    </Top>
  );
  const middle = (
    <Middle>
      <MiddleContent>
        <MiddleHeader>
          What are the {protocolDisplayName} claim tokens
        </MiddleHeader>
        <MiddleDivider />
        <MiddleText>
          Each{' '}
          <b>
            {protocolDisplayName} ({protocolName})
          </b>{' '}
          claim token will pay out 1 {collateralName} in the event that there is
          a successful attack on the protocol before the expiration date (
          {dateTime})
        </MiddleText>
        <MiddleHeader>What is covered?</MiddleHeader>
        <MiddleDivider />
        <MiddleText>
          During the coverage period (before the expiration date) if{' '}
          {protocolDisplayName} suffers a hack, bug, exploit or economic
          manipulation attack, and that there’s a material loss of deposited
          funds from the {protocolDisplayName} smart contract, or smart contract
          system with funds either moved to another address which the original
          owner(s) do not control, or the funds are made permanently
          irrecoverable. You will get back 1 {collateralName} per each{' '}
          {protocolName} claim token.
        </MiddleText>

        <FullDocumentation
          href="https://coverprotocol.medium.com"
          target="_blank"
        >
          <StyledIcon type="externalLink" />
          Full Documentation
        </FullDocumentation>
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
          <BalanceText>Your DAI: {daiBalanceOf}</BalanceText>
        </BottomLeftTop>
        <BottomLeftBottom>
          <RoundedInput right={claimInputTop} />
          <EquivalentWrapper>
            <EquivalentText>Equivalent to:</EquivalentText>
            <ArrowWrapper>
              <ArrowDown type="arrowDown" />
            </ArrowWrapper>
          </EquivalentWrapper>
          <BottomInputWrapper>
            <RoundedInput right={claimInputBottom} />
          </BottomInputWrapper>
        </BottomLeftBottom>
      </BottomLeft>
      <BottomRight>
        <AmountText>Summary</AmountText>
        <SummaryText>
          You will spend 500 {collateralName} to acquire 4959{' '}
          {protocolDisplayName} claim tokens, covering a position equivalent to
          6.106 {protocolName} (at current market price of 81,88 $ per{' '}
          {protocolName}).
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

CoverDetailCard.whyDidYouRender = true;
export default CoverDetailCard;
