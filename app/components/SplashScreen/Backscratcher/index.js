import React from 'react';
import 'twin.macro';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import LogoImg from '../../../images/Splash/logo.svg';

const Logo = styled.div`
  img {
    width: 60vw;
    max-width: 270px;
    margin: 0 auto;
  }
`;

const HeaderText = styled.div`
  font-size: 18px;
  font-family: 'roboto light';
  text-align: center;
  letter-spacing: 1px;
  @media (max-width: 570px) {
    max-width: 280px;
  }
`;
const HeaderTextBig = {
  fontSize: '24px',
  letterSpacing: '1.6px',
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
`;

export const Backscratcher = () => (
  <div
    tw="bg-black w-screen relative flex flex-col justify-center items-center overflow-hidden"
    css={backgroundStyle}
  >
    <div tw="flex flex-col justify-center items-center z-10 absolute">
      <Logo tw="mb-8">
        <img src={LogoImg} alt="logo" />
      </Logo>

      <div tw="text-white font-bold md:text-3xl justify-center flex flex-col items-center text-2xl">
        <HeaderText style={HeaderTextBig}>Building for the future</HeaderText>
      </div>
      <div tw="text-white font-bold md:text-3xl justify-center flex flex-col items-center mb-6 text-2xl">
        <HeaderText>Are you ready?</HeaderText>
      </div>

      <Link
        style={buttonLink}
        type="button"
        tw="bg-yearn-blue px-6 rounded-lg py-1.5 flex justify-center items-center align-middle no-underline"
        to="/vaults"
      >
        <p tw="text-white text-base font-sans font-black no-underline">
          Go to Backscratcher
        </p>
      </Link>
    </div>
  </div>
);
