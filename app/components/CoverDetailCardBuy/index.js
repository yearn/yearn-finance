import React, { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { buyCover as buyCoverAction } from 'containers/Cover/actions';
import { useContract } from 'containers/DrizzleProvider/hooks';
import styled from 'styled-components';
import tw from 'twin.macro';
import BlueOutlineCard from 'components/BlueOutlineCard';
import TokenIcon from 'components/TokenIcon';
import Icon from 'components/Icon';
import RoundedInput from 'components/RoundedInput';
import ButtonFilled from 'components/ButtonFilled';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectContractDataComplex,
  selectTokenAllowance,
} from 'containers/App/selectors';
import { calculateAmountNeeded, calculateAmountOutFromBuy } from 'utils/cover';
import { formatNumber } from 'utils/string';
import Web3 from 'web3';

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
  ${tw`w-4/5 m-0 m-auto`}
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
  ${tw`flex items-center md:items-start md:space-x-20 md:justify-between flex-col md:flex-row py-0 px-10`}
`;

const BuyHeader = styled.div`
  margin-left: 16px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-size: 24px;
  color: #ffffff;
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
  ${tw`w-full`}
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

// const BottomRight = styled.div`
//   width: 288px;
//   display: flex;
//   flex-direction: column;
// `;

const BottomRight = styled.div`
  ${tw`flex flex-col  w-4/5`}
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
  margin-left: 2px;
  top: -1px;
  display: inline-block;
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
  margin: 0px 7px;
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

function CoverDetailCardBuy(props) {
  const dispatch = useDispatch();
  const [amountWei, setAmountWei] = useState();

  const {
    className,
    protocol,
    claimPool,
    amount,
    setAmount,
    equivalentTo,
    setEquivalentTo,
  } = props;
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

  const equivalentToRef = useRef(null);
  const amountRef = useRef(null);

  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const daiData = useSelector(selectContractDataComplex(daiAddress));

  const claimPoolAddress = Web3.utils.toChecksumAddress(claimPool.address);
  const claimPoolContract = useContract(claimPoolAddress);
  const daiContract = useContract(daiAddress);

  const claimPoolAllowance = useSelector(
    selectTokenAllowance(daiAddress, claimPoolAddress),
  );

  const poolAllowedToSpendDai = claimPoolAllowance > 0;

  const daiBalanceOf = _.get(daiData, 'balanceOf[0].value');
  let daiBalanceOfNormalized = new BigNumber(daiBalanceOf)
    .dividedBy(10 ** 18)
    .toFixed(5);
  if (Number.isNaN(daiBalanceOfNormalized)) {
    daiBalanceOfNormalized = '0';
  }

  const updateAmount = (evt) => {
    const newAmount = evt.target.value;
    setAmount(newAmount);
    setAmountWei(new BigNumber(newAmount).times(10 ** 18).toFixed(0)); // TODO: Update for token decimals
    const tokensNeeded = calculateAmountNeeded(newAmount, claimPool);
    let equivalentToVal = 0;
    if (claimPool.price && tokensNeeded) {
      equivalentToVal = tokensNeeded;
    }
    equivalentToRef.current.value = equivalentToVal.toFixed(5);
    setEquivalentTo(equivalentToVal);
  };

  const updateEquivalentToVal = (val) => {
    const { daiInPool, covTokenWeight, price, swapFee } = claimPool;

    const newAmount = calculateAmountOutFromBuy(
      val,
      daiInPool,
      covTokenWeight,
      swapFee,
      price,
    );

    setAmountWei(new BigNumber(newAmount).times(10 ** 18).toFixed(0));
    setAmount(newAmount);
    setEquivalentTo(val);
    amountRef.current.value = newAmount.toFixed(5);
    equivalentToRef.current.value = val;
  };

  const setMaxClaimAmount = () => {
    const { daiInPool, covTokenWeight, price, swapFee } = claimPool;
    // TODO: Update calculations to use WEI...
    const newAmount = calculateAmountOutFromBuy(
      new BigNumber(daiBalanceOf).dividedBy(10 ** 18).toFixed(),
      daiInPool,
      covTokenWeight,
      swapFee,
      price,
    );

    // TODO: Fix this.. we can only approximate until calculations use WEI values
    const daiBalanceNormalized = new BigNumber(daiBalanceOf)
      .dividedBy(10 ** 18)
      .toFixed(5);
    setAmountWei(new BigNumber(newAmount).times(10 ** 18).toFixed(0));
    setAmount(newAmount);
    amountRef.current.value = newAmount.toFixed(5);
    setEquivalentTo(daiBalanceNormalized);
    equivalentToRef.current.value = daiBalanceNormalized;
  };

  const buyCover = async () => {
    console.log(`Buying cover: ${amountWei}`);

    dispatch(
      buyCoverAction({
        poolAllowedToSpendDai,
        protocol,
        claimPoolContract,
        daiContract,
        amount: amountWei,
        equivalentTo,
      }),
    );
  };

  const daiSpendText =
    (equivalentToRef.current && equivalentToRef.current.value) || '0';

  const claimInputBottom = (
    <React.Fragment>
      <SmallTokenIcon address={daiAddress} />
      <InputTextRight>DAI</InputTextRight>
    </React.Fragment>
  );

  const claimInputTop = (
    <InputTextRight>
      <MaxWrapper onClick={setMaxClaimAmount}>
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
          <BalanceText>Your DAI: {daiBalanceOfNormalized}</BalanceText>
        </BottomLeftTop>
        <BottomLeftBottom>
          <RoundedInput
            right={claimInputTop}
            onChange={updateAmount}
            ref={amountRef}
          />
          <EquivalentWrapper>
            <EquivalentText>Purchase cost:</EquivalentText>
            <ArrowWrapper>
              <ArrowDown type="arrowDown" />
            </ArrowWrapper>
          </EquivalentWrapper>
          <BottomInputWrapper>
            <RoundedInput
              right={claimInputBottom}
              onChange={(evt) => updateEquivalentToVal(evt.target.value)}
              ref={equivalentToRef}
            />
          </BottomInputWrapper>
        </BottomLeftBottom>
      </BottomLeft>
      <BottomRight>
        <AmountText>Summary</AmountText>
        <SummaryText>
          You will spend {formatNumber(daiSpendText)} DAI to acquire{' '}
          {formatNumber(amount)} {protocolDisplayName} claim tokens. Each{' '}
          {protocolDisplayName} claim token will be redeemable for 1{' '}
          {collateralName} in the event of a hack.
        </SummaryText>
        <ButtonWrapper>
          <ButtonFilled variant="contained" color="primary" onClick={buyCover}>
            {poolAllowedToSpendDai ? 'Buy Cover' : 'Approve'}
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

CoverDetailCardBuy.whyDidYouRender = false;
export default CoverDetailCardBuy;
