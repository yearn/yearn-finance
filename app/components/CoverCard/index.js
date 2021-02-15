import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TokenIcon from 'components/TokenIcon';
import {
  getShortenedAddress,
  abbreviateRelativeTime,
  daysFromNow,
} from 'utils/string';
import Icon from 'components/Icon';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

const Wrapper = styled(Link)`
  height: 312px;
  background-color: ${(props) => props.theme.surface};
  border-radius: 15px;
  position: relative;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.white};
`;

const claimBackgroundColor = (props) => {
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
  min-height: 60px;
  margin-bottom: 19px;
`;

const ProtocolName = styled.div`
  font-weight: 900;
  font-size: 30px;
  margin-bottom: 14px;
  line-height: 24px;
`;

const ProtocolUrl = styled.a`
  text-decoration: underline;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  position: absolute;
  top: 189px;
  justify-self: center;
`;

const ProtocolUrlPlaceholder = styled.div`
  height: 30px;
`;

const Card = styled.div`
  width: 100%;
  position: relative;
  display: grid;
`;

const Address = styled.div`
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 21px;
  display: flex;
`;

const CountdownText = styled.div`
  display: flex;
`;

// const Copy = styled(Icon)`
//   top: 2px;
//   left: 6px;
//   position: relative;
// `;

const Clock = styled(Icon)`
  left: -5px;
  position: relative;
`;

// const Stats = styled(Icon)`
//   top: 0px;
//   left: 0px;
//   position: relative;
// `;

const PercentLeft = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

const TotalCollateral = styled.div`
  font-size: 14px;
  opacity: 0.5;
`;

export default function CoverCard(props) {
  const { onClick, disabled, className, protocol, claimTokenBalanceOf } = props;

  const [currentTime, setCurrentTime] = useState(Date.now());

  const updateTime = () => {
    setCurrentTime(Date.now());
  };
  useEffect(() => {
    setInterval(updateTime, 10000);
  }, []);

  const { protocolDisplayName, protocolUrl, protocolTokenAddress } = protocol;
  const shortenedAddress = getShortenedAddress(protocolTokenAddress);
  const userHasClaimForProtocol = parseInt(claimTokenBalanceOf, 10) > 0;

  const expirationTimestamp =
    protocol.expirationTimestamps[protocol.claimNonce];
  // const totalCollateral =
  //   protocol.coverObjects[protocol.claimNonce].collateralStaked;

  // const { collateralName } = protocol.coverObjects[protocol.claimNonce];
  // const totalCollateralStr = formatNumber(removeDecimals(totalCollateral));

  const countDown = abbreviateRelativeTime(currentTime, expirationTimestamp);
  const coverDaysLeft = daysFromNow(currentTime, expirationTimestamp);
  const expiringSoon = coverDaysLeft < 6;

  let cardContent;
  let protocolUrlEl;
  if (!claimTokenBalanceOf) {
    cardContent = (
      <Middle>
        <CircularProgress color="white" />
      </Middle>
    );
  } else {
    protocolUrlEl = (
      <ProtocolUrl href={`https://${protocolUrl}`} target="_blank">
        {protocolUrl}
      </ProtocolUrl>
    );
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
            <PercentLeft />
            <TotalCollateral />
          </div>
          <div />
        </Top>
        <Middle>
          <StyledTokenIcon address={protocolTokenAddress} />
          <ProtocolName>{protocolDisplayName}</ProtocolName>
          <ProtocolUrlPlaceholder />
          <Address>{shortenedAddress}</Address>
        </Middle>
        <Bottom
          userHasClaimForProtocol={userHasClaimForProtocol}
          expiringSoon={expiringSoon}
        >
          <div>{coverText}</div>
          <CountdownText>
            <Clock type="clock" /> {countDown}
          </CountdownText>
        </Bottom>
      </React.Fragment>
    );
  }

  return (
    <Card>
      <Wrapper
        className={className}
        to={`/cover/${protocol.protocolAddress}`}
        disabled={disabled}
        onClick={onClick}
      >
        {cardContent}
      </Wrapper>
      {protocolUrlEl}
    </Card>
  );
}
