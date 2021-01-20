import React from 'react';
import styled from 'styled-components';
import { selectContractData } from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import TokenIcon from 'components/TokenIcon';
import { formatNumber } from 'utils/string';
import { calculateAmountNeeded } from 'utils/cover';

// const Wrapper = styled.div`
//   margin-left: 50px;
//   background-color: ${(props) => props.theme.vaultBackground};
//   width: 330px;
//   border-radius: 15px;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
// `;

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.vaultBackground};
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  margin-top: 48px;
  @media (min-width: 768px) {
    width: 330px;
    margin-left: 50px;
    margin-top: 0px;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0px;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 60px;
`;

const MiddleWrapper = styled.div`
  width: 210px;
  margin: 0 auto;
`;

const TokenName = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 900;
  font-size: 30px;
  color: #ffffff;
  margin-top: 15px;
`;

const TokenTitle = styled.div`
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.882353px;
  margin-top: 5px;
  color: #ffffff;
`;

const Time = styled.div`
  font-family: 'Roboto Light';
  font-weight: bold;
  font-size: 21px;
  letter-spacing: 0.5px;
  color: #ffffff;
`;

const Label = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.5px;
  color: #ffffff;
  mix-blend-mode: normal;
  margin-bottom: 35px;
`;

const PriceWrapper = styled.div`
  display: flex;
`;

const PlusText = styled.div`
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.529412px;
  color: #23d198;
  display: flex;
  align-items: center;
  margin-left: 5px;
`;

const MinusText = styled.div`
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.529412px;
  color: #ef1e02;
  display: flex;
  align-items: center;
  margin-left: 5px;
`;

// This component shows the pending changes according to cover amount and cost
// according to currently entered data by the user.
const ChangeText = ({ amount, operation }) => {
  let operator;
  let PlusOrMinusComponent;
  if (operation === 'buy') {
    operator = '+';
    PlusOrMinusComponent = PlusText;
  } else {
    operator = '-';
    PlusOrMinusComponent = MinusText;
  }

  const amountText = amount ? `${operator}${formatNumber(Number(amount))}` : '';
  return <PlusOrMinusComponent>{amountText}</PlusOrMinusComponent>;
};

export default function CoverTallCard(props) {
  const {
    protocol,
    claimPool,
    buyAmount,
    buyEquivalentTo,
    sellAmount,
    sellEquivalentTo,
    claimTokenBalanceOfNormalized,
    claimTokenBalanceOf,
  } = props;
  const protocolDisplayName = _.get(protocol, 'protocolDisplayName');
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

  const expirationTimestamp =
    _.get(protocol, `coverObjects.${claimNonce}.expirationTimestamp`) * 1000;
  const collateralData = useSelector(selectContractData(collateralAddress));
  const collateralDecimals = collateralData.decimals;
  const totalSupplyHex = _.get(
    protocol,
    `coverObjects.${claimNonce}.tokens.claimTotalSupply.hex`,
  );
  const totalSupply = formatNumber(
    new BigNumber(totalSupplyHex)
      .dividedBy(10 ** collateralDecimals)
      .toFixed(0),
  );

  const expirationDateTime = new Date(expirationTimestamp);

  const dateTime = expirationDateTime
    .toLocaleString('en', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '');

  let tokenAmount;
  let equivalentToAmount;
  let operation;

  const buyDataPopulated =
    !_.isNaN(Number(buyAmount)) && Number(buyAmount) !== 0;

  const sellDataPopulated =
    !_.isNaN(Number(sellAmount)) && Number(sellAmount) !== 0;

  // The user can populate both buy and sell amounts at the same time, if they
  // have done this then we will show show updates values as per sell data and
  // notify them of this.
  if (buyDataPopulated && sellDataPopulated) {
    // User has populated both buy and sell data, use sell data.
    tokenAmount = sellAmount;
    equivalentToAmount = sellEquivalentTo;
    operation = 'sell';
  } else if (buyDataPopulated) {
    tokenAmount = buyAmount;
    equivalentToAmount = buyEquivalentTo;
    operation = 'buy';
  } else if (sellDataPopulated) {
    tokenAmount = sellAmount;
    equivalentToAmount = sellEquivalentTo;
    operation = 'sell';
  }

  const tokensNeeded = calculateAmountNeeded(buyAmount, claimPool);

  let tokenPrice = 'Unknown';
  if (claimPool.price && tokenAmount && tokenAmount !== '0') {
    tokenPrice = (tokensNeeded / parseFloat(tokenAmount)).toFixed(5);
  } else if (claimPool.price) {
    tokenPrice = claimPool.price.toFixed(5);
  }

  const equivalentToText =
    equivalentToAmount && equivalentToAmount !== '0'
      ? `+${formatNumber(Number(equivalentToAmount))}`
      : '';

  const accountCoverage = new BigNumber(claimTokenBalanceOf)
    .times(claimPool.price)
    .dividedBy(10 ** 18)
    .toFixed(5);

  return (
    <div>
      <Wrapper>
        <MiddleWrapper>
          <IconWrapper>
            <StyledTokenIcon address={protocolTokenAddress} />
            <TokenName>{protocolDisplayName}</TokenName>
            <TokenTitle>claim tokens</TokenTitle>
          </IconWrapper>
          <Time>{dateTime}</Time>
          <Label>Expiration Date</Label>
          <Time>
            {totalSupply} {collateralName}
          </Time>
          <Label>Total Collateral</Label>
          <Time>{tokenPrice}</Time>
          <Label>Token Price</Label>
          <PriceWrapper>
            <Time>
              {claimTokenBalanceOfNormalized} {collateralName}
            </Time>
            <ChangeText operation={operation} amount={tokenAmount} />
          </PriceWrapper>
          <Label>Cover amount</Label>
          <PriceWrapper>
            <Time>${accountCoverage}</Time>
            <ChangeText operation={operation} amount={equivalentToText} />
          </PriceWrapper>
          <Label>Value of cover</Label>

          {buyDataPopulated &&
            sellDataPopulated &&
            'Amounts have been entered for both buying and selling cover, currently showing changes for operation.'}
        </MiddleWrapper>
      </Wrapper>
    </div>
  );
}
