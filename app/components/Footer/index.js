import React from 'react';
import styled from 'styled-components';
import YearnLogo from 'images/yearn-logo.svg';
import GithubLogo from 'images/github-logo.svg';
import TwitterLogo from 'images/twitter-logo.svg';
import MediumLogo from 'images/medium-logo.svg';
import DiscordLogo from 'images/discord-logo.svg';
import AlchemyLogo from 'images/alchemy-logo.svg';

const Wrapper = styled.div`
  width: 100%;
  background-color: #05132e;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`;

const FooterInner = styled.div`
  margin-top: 56px;
  margin-bottom: 56px;
  width: 90%;
  min-width: 640px;
  max-width: 1200px;
`;

const TopLeft = styled.div``;

const BottomLeft = styled.div``;

const TopRight = styled.div`
  display: inline-flex;
  grid-gap: 24px;
  height: 40px;
`;

const BottomRight = styled.div`
  font-size: 14px;
  opacity: 0.5;
  align-items: center;
  display: flex;
`;

const Logo = styled.img`
  height: 40px;
`;

const Top = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    grid-gap: 24px;
    margin-bottom: 24px;
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    grid-gap: 24px;
    margin-top: 0px;
  }
`;

const InvertedLogo = styled.img`
  height: 40px;
  filter: invert();
`;

const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <Wrapper>
      <FooterInner>
        <Top>
          <TopLeft>
            <Logo src={YearnLogo} alt="Yearn" />
          </TopLeft>
          <TopRight>
            <a href="https://twitter.com/iearnfinance" target="_blank">
              <Logo src={TwitterLogo} alt="" />
            </a>
            <a
              href="https://github.com/yearn/yearn-finance.git"
              target="_blank"
            >
              <Logo src={GithubLogo} alt="" />
            </a>
            <a href="https://discord.com/invite/6PNv2nF/" target="_blank">
              <InvertedLogo src={DiscordLogo} alt="" />
            </a>
            <a href="https://medium.com/iearn" target="_blank">
              <InvertedLogo src={MediumLogo} alt="" />
            </a>
          </TopRight>
        </Top>
        <Bottom>
          <BottomLeft>
            <a
              href="https://dashboard.alchemyapi.io/signup?referral=c642981b-19e0-45e9-a169-0b80b633992b"
              target="_blank"
            >
              <Logo src={AlchemyLogo} alt="" />
            </a>
          </BottomLeft>
          <BottomRight>{`Copyright © yearn ${currentYear}. All rights reserved.`}</BottomRight>
        </Bottom>
      </FooterInner>
    </Wrapper>
  );
}

export default Footer;
