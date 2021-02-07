import React from 'react';
import 'twin.macro';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import LogoImg from '../../../images/Splash/logo.svg';

const Logo = styled.div`
  img {
    width: 60vw;
    max-width: 270px;
    opacity: 0.8;
    margin: 0 auto;
  }
`;

const HeaderText = styled.div`
  font-size: 19px;
  font-family: 'roboto light';
  text-align: center;
  letter-spacing: 2.2px;
  @media (max-width: 570px) {
    max-width: 280px;
  }
  line-height: 28px;
  margin-bottom: 10px;
`;

const Percent = styled.div`
  display: inline;
  opacity: 1;
`;

const Grey = styled.div`
  display: inline;
  opacity: 0.5;
`;

const HeaderTextBig = {
  fontSize: '40px',
  letterSpacing: '1.0px',
  marginBottom: '6px',
  lineHeight: '43px',
  marginTop: '30px',
  opacity: '1',
};

const buttonLink = {
  background: '#4F41FF',
};

const backgroundStyle = `
  height: calc(100vh - 64px);
  @media (max-width: 570px) {
    height: calc(100vh);
    font-size: 35px;
  }
  background-color: #111;
`;

const imageStyle = `
  animation: cowmove 4s infinite;
  @keyframes cowmove{
      0% {
        transform: rotate(0deg);
      }
      49% {
        transform: rotate(-20deg);
      }
  }
  opacity: .9;
`;

export const Backscratcher = () => (
  <div
    tw="w-screen relative flex flex-col justify-center items-center overflow-hidden"
    css={backgroundStyle}
  >
    <div tw="flex flex-col justify-center items-center z-10 absolute">
      <Logo tw="mb-8">
        <img css={imageStyle} src={LogoImg} alt="logo" />
      </Logo>

      <div tw="text-white font-bold md:text-3xl justify-center flex flex-col items-center text-2xl">
        <HeaderText style={HeaderTextBig}>Maximize your CRV rewards</HeaderText>
      </div>
      <div tw="text-white font-bold md:text-3xl justify-center flex flex-col items-center mb-6 text-2xl">
        <HeaderText>
          <Grey>Earn</Grey> <Percent>38% more</Percent>{' '}
          <Grey>in weekly fees staking with Yearn</Grey>
        </HeaderText>
      </div>

      <Link
        style={buttonLink}
        type="button"
        tw="bg-yearn-blue px-6 rounded-lg py-1.5 flex justify-center items-center align-middle no-underline"
        to="/vaults"
      >
        <p tw="text-white text-base font-sans font-black no-underline">
          GO TO VAULTS
        </p>
      </Link>
    </div>
  </div>
);
