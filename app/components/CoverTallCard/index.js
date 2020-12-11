import React from 'react';
import styled from 'styled-components';
// import Icon from 'components/Icon';
import TokenIcon from 'components/TokenIcon';

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

  return (
    <div>
      <Wrapper>
        <MiddleWrapper>
          <IconWrapper>
            <StyledTokenIcon address={protocolTokenAddress} />
            <TokenName>{protocolDisplayName}</TokenName>
            <TokenTitle>claim tokens</TokenTitle>
          </IconWrapper>
          <Time>5/31/2021 12:00 AM</Time>
          <Label>Expiration Date</Label>
          <Time>291,319.70 {collateralName}</Time>
          <Label>Available Cover</Label>
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
