import React from 'react';
import styled from 'styled-components';
import TokenIcon from 'components/TokenIcon';
import {
  getShortenedAddress,
  abbreviateRelativeTime,
  daysFromNow,
  addCommasToNumber,
  removeDecimals,
} from 'utils/string';
import Icon from 'components/Icon';

const Wrapper = styled.div`
  height: 312px;
  background-color: ${props => props.theme.vaultBackground};
  border-radius: 15px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.white};
`;

const claimBackgroundColor = props => {
  const {
    userHasClaimForProtocol,
    expiringSoon,
    theme: { blocksRed, blocksGreen, blocksMidnight },
  } = props;
  if (userHasClaimForProtocol) {
    if (expiringSoon) {
      return blocksRed;
    }
    return blocksGreen;
  }
  return blocksMidnight;
};

const Bottom = styled.div`
  background-color: ${claimBackgroundColor};
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  border-radius: 0px 0px 15px 15px;
  height: 40px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;
  font-family: 'Roboto Light';
  font-style: normal;
  font-weight: bold;
`;

const Top = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  margin-top: 12px;
  align-items: baseline;
  justify-content: space-between;
  font-size: 16px;
  padding: 0px 20px;
  font-family: 'Roboto Medium';
  font-style: normal;
  font-weight: bold;
`;

const Middle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 60px;
  margin-bottom: 19px;
`;

const ProtocolName = styled.div`
  font-weight: 900;
  font-size: 30px;
  font-family: 'Roboto Medium';
  margin-bottom: 14px;
  line-height: 24px;
`;

const ProtocolUrl = styled.a`
  font-weight: 500;
  font-family: 'Roboto Medium';
  font-size: 16px;
  line-height: 16px;
  margin-bottom: 14px;
`;

const Address = styled.div`
  font-family: 'Roboto Mono Light';
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 21px;
`;

const Copy = styled(Icon)`
  top: 4px;
  position: relative;
`;

const Clock = styled(Icon)`
  top: 2px;
  left: -2px;
  position: relative;
`;

const Stats = styled(Icon)`
  top: 0px;
  left: 0px;
  position: relative;
`;

const PercentLeft = styled.div`
  font-family: 'Roboto Mono Light';
  font-weight: bold;
  font-size: 16px;
`;

const TotalCollateral = styled.div`
  font-family: 'Roboto Mono Light';
  font-size: 14px;
  opacity: 0.5;
`;

export default function CoverCard(props) {
  const {
    onClick,
    disabled,
    className,
    protocol,
    claimTokenBalanceOf,
    currentTime,
  } = props;
  const { protocolDisplayName, protocolUrl, protocolTokenAddress } = protocol;
  const shortenedAddress = getShortenedAddress(protocolTokenAddress);
  const userHasClaimForProtocol = parseInt(claimTokenBalanceOf, 10) > 0;

  const expirationTimestamp =
    protocol.expirationTimestamps[protocol.claimNonce];
  const totalCollateral =
    protocol.coverObjects[protocol.claimNonce].collateralStaked;
  const totalCollateralStr = addCommasToNumber(removeDecimals(totalCollateral));

  const countDown = abbreviateRelativeTime(currentTime, expirationTimestamp);
  const coverDaysLeft = daysFromNow(currentTime, expirationTimestamp);
  const expiringSoon = coverDaysLeft < 6;

  let cardContent;
  if (!claimTokenBalanceOf) {
    cardContent = <Middle>Loading...</Middle>;
  } else {
    const userHasCover = parseInt(claimTokenBalanceOf, 10) > 0;
    let coverText;
    if (userHasCover) {
      if (expiringSoon) {
        coverText = 'Cover expiring soon';
      } else {
        coverText = 'Covered';
      }
    } else {
      coverText = 'Not Covered';
    }
    cardContent = (
      <React.Fragment>
        <Top>
          <div>
            <PercentLeft>5% left</PercentLeft>
            <TotalCollateral>{totalCollateralStr} DAI</TotalCollateral>
          </div>
          <div>
            <Stats type="stats" />
          </div>
        </Top>
        <Middle>
          <StyledTokenIcon address={protocolTokenAddress} />
          <ProtocolName>{protocolDisplayName}</ProtocolName>
          <ProtocolUrl href={`https://${protocolUrl}`} target="_blank">
            {protocolUrl}
          </ProtocolUrl>
          <Address>
            {shortenedAddress} <Copy type="copy" />
          </Address>
        </Middle>
        <Bottom
          userHasClaimForProtocol={userHasClaimForProtocol}
          expiringSoon={expiringSoon}
        >
          <div>{coverText}</div>
          <div>
            <Clock type="clock" /> {countDown}
          </div>
        </Bottom>
      </React.Fragment>
    );
  }

  return (
    <Wrapper
      className={className}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {cardContent}
    </Wrapper>
  );
}
