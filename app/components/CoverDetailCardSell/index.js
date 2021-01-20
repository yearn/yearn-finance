import React, { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import BlueOutlineCard from 'components/BlueOutlineCard';
import ButtonFilled from 'components/ButtonFilled';
import Icon from 'components/Icon';
import RoundedInput from 'components/RoundedInput';
import TokenIcon from 'components/TokenIcon';
import { selectTokenAllowance } from 'containers/App/selectors';
import { sellCover as sellCoverAction } from 'containers/Cover/actions';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import tw from 'twin.macro';
import {
  calculateAmountOutFromSell,
  calculateAmountInFromSell,
} from 'utils/cover';
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

const SellHeader = styled.div`
  margin-left: 16px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-size: 24px;
  color: #ffffff;
`;

const StyledBlueOutlineCard = styled(BlueOutlineCard)`
  max-width: 750px;
  ${tw`w-full mt-12`}
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

function CoverDetailCardSell(props) {
  const {
    className,
    protocol,
    amount,
    setAmount,
    claimPool,
    setEquivalentTo,
    claimTokenBalanceOf,
    claimTokenBalanceOfNormalized,
  } = props;

  const [amountWei, setAmountWei] = useState();

  const dispatch = useDispatch();
  const protocolDisplayName = _.get(protocol, 'protocolDisplayName');
  const protocolName = _.get(protocol, 'protocolName');
  const protocolTokenAddress = _.get(protocol, 'protocolTokenAddress');
  const claimNonce = _.get(protocol, 'claimNonce');
  const claimTokenAddress = _.get(protocol, [
    'coverObjects',
    claimNonce,
    'tokens',
    'claimAddress',
  ]);

  const claimTokenContract = useContract(claimTokenAddress);

  const equivalentToRef = useRef(null);
  const amountRef = useRef(null);

  const updateAmount = (evt) => {
    const newAmount = evt.target.value;
    setAmount(newAmount);
    setAmountWei(new BigNumber(newAmount).times(10 ** 18).toFixed(0));
    const { covTokenBalance, covTokenWeight, price, swapFee } = claimPool;

    const daiWeight = 1 - covTokenWeight;

    const sellEquivalent = calculateAmountOutFromSell(
      newAmount,
      covTokenBalance,
      daiWeight,
      swapFee,
      price,
    );

    equivalentToRef.current.value = sellEquivalent.toFixed(5);
    setEquivalentTo(sellEquivalent);
  };

  const equivalentDai = _.get(equivalentToRef, 'current.value', '0');

  const updateEquivalentToVal = (val) => {
    const { covTokenBalance, covTokenWeight, price, swapFee } = claimPool;
    const daiWeight = 1 - covTokenWeight;

    const newAmount = calculateAmountInFromSell(
      val,
      covTokenBalance,
      daiWeight,
      swapFee,
      price,
    );

    amountRef.current.value = newAmount.toFixed(5);
    setAmount(newAmount);
    setAmountWei(new BigNumber(newAmount).times(10 ** 18).toFixed(0));
    setEquivalentTo(val);
  };

  const updateEquivalentTo = (evt) => {
    const newSellAmount = evt.target.value;
    updateEquivalentToVal(newSellAmount);
  };

  const setMaxClaimAmount = () => {
    const maxAmount = claimTokenBalanceOfNormalized;
    setAmountWei(claimTokenBalanceOf);
    setAmount(maxAmount);
    amountRef.current.value = maxAmount;

    const { covTokenBalance, covTokenWeight, price, swapFee } = claimPool;

    const daiWeight = 1 - covTokenWeight;

    const sellEquivalent = calculateAmountOutFromSell(
      maxAmount,
      covTokenBalance,
      daiWeight,
      swapFee,
      price,
    );

    equivalentToRef.current.value = sellEquivalent.toFixed(5);
    setEquivalentTo(sellEquivalent);
  };

  const claimPoolAddress = Web3.utils.toChecksumAddress(claimPool.address);
  const claimPoolContract = useContract(claimPoolAddress);

  const claimPoolAllowance = useSelector(
    selectTokenAllowance(claimTokenAddress, claimPoolAddress),
  );

  const poolAllowedToSpendCoverToken = claimPoolAllowance > 0;

  const sellCover = async () => {
    console.log(`Selling cover: ${amountWei}`);
    dispatch(
      sellCoverAction({
        poolAllowedToSpendCoverToken,
        claimPoolContract,
        claimTokenContract,
        amount: amountWei,
      }),
    );
  };

  const claimInputTop = (
    <InputTextRight>
      <MaxWrapper onClick={setMaxClaimAmount}>
        <Max>Max</Max>
        <div>claim tokens</div>
      </MaxWrapper>
    </InputTextRight>
  );

  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  const claimInputBottom = (
    <InputTextRight>
      <MaxWrapper>
        <SmallTokenIcon address={daiAddress} />
        <InputTextRight>DAI</InputTextRight>
      </MaxWrapper>
    </InputTextRight>
  );

  const top = (
    <Top>
      <StyledTokenIcon address={protocolTokenAddress} />
      <SellHeader>Sell your {protocolDisplayName} cover</SellHeader>
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
          {protocolDisplayName} position anymore you can use this panel to sell
          your {protocolName} claim tokens.
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
          <BalanceText>
            Your balance: {claimTokenBalanceOfNormalized}
          </BalanceText>
        </BottomLeftTop>
        <BottomLeftBottom>
          <RoundedInput
            ref={amountRef}
            onChange={updateAmount}
            right={claimInputTop}
          />
          <EquivalentWrapper>
            <EquivalentText>Sell price:</EquivalentText>
            <ArrowWrapper>
              <ArrowDown type="arrowDown" />
            </ArrowWrapper>
          </EquivalentWrapper>
          <BottomInputWrapper>
            <RoundedInput
              onChange={updateEquivalentTo}
              ref={equivalentToRef}
              right={claimInputBottom}
            />
          </BottomInputWrapper>
        </BottomLeftBottom>
      </BottomLeft>
      <BottomRight>
        <AmountText>Summary</AmountText>
        <SummaryText>
          You will sell {formatNumber(amount) || '0'} claim tokens and will get
          back {formatNumber(equivalentDai)} DAI.
        </SummaryText>
        <ButtonWrapper>
          <ButtonFilled variant="contained" color="primary" onClick={sellCover}>
            {poolAllowedToSpendCoverToken ? 'Sell Cover' : 'Approve'}
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
