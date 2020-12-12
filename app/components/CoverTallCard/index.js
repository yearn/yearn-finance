import React from 'react';
import styled from 'styled-components';
import { selectContractData } from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import TokenIcon from 'components/TokenIcon';
import { addCommasToNumber } from 'utils/string';

const Wrapper = styled.div`
  margin-left: 50px;
  background-color: ${props => props.theme.vaultBackground};
  width: 330px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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

export default function CoverTallCard(props) {
  const { protocol } = props;
  const protocolDisplayName = _.get(protocol, 'protocolDisplayName');
  // const protocolName = _.get(protocol, 'protocolName');
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
  const totalSupply = addCommasToNumber(
    new BigNumber(totalSupplyHex)
      .dividedBy(10 ** collateralDecimals)
      .toFixed(0),
  );

  const expirationDateTime = new Date(expirationTimestamp);

  // const dateTime = `${expirationDateTime.getMonth()}/${expirationDateTime.getDay()}/${expirationDateTime.getYear()} ${expirationDateTime.getHours()}:${expirationDateTime.getMinutes()}:${expirationDateTime.getSeconds()}`;
  const dateTime = expirationDateTime
    .toLocaleString('en', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '');
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
          <Time>0.10 DAI</Time>
          <Label>Token Price</Label>
          <PriceWrapper>
            <Time>240 {collateralName}</Time>
            <PlusText>+4959</PlusText>
          </PriceWrapper>
          <Label>Your claim tokens balance</Label>
          <PriceWrapper>
            <Time>0 {collateralName}</Time>
            <PlusText>+500</PlusText>
          </PriceWrapper>
          <Label>Your Cover</Label>
        </MiddleWrapper>
      </Wrapper>
    </div>
  );
}
