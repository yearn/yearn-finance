import React from 'react';
import { css } from 'twin.macro';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MarqueStats } from './MarqueeStats';
import HeroBg from '../../../images/Splash/hero-bg-svg.svg';
import HeroMobileBg from '../../../images/Splash/hero-mobile.svg';

const HeaderText = styled.div`
  font-size: 20px;
  font-family: 'roboto light';
  text-align: center;
  @media (max-width: 570px) {
    max-width: 280px;
  }
`;

const SloganText = styled.div`
  text-align: center;
`;

export const Hero = () => (
  <div
    tw="bg-black w-screen relative flex flex-col justify-center items-center overflow-hidden"
    css={[
      css`
        height: calc(100vh - 64px);
        background-size: 100% 100%;
        background-image: url(${HeroBg});
        @media (max-width: 1024px) {
          background-image: url(${HeroBg});
          background-repeat: no-repeat;
          background-position: center;
          background-size: 110%;
        }
        @media (max-width: 768px) {
          background-image: url(${HeroBg});
          background-size: 110%;
          background-position: center;
          background-repeat: no-repeat;
        }
        @media (max-width: 570px) {
          background-image: url(${HeroMobileBg});
          background-repeat: no-repeat;
          background-position: center 20px -5px;
          background-size: 97%;
          margin-top: -78px;
          height: calc(100vh);
          font-size: 35px;
        }
      `,
    ]}
  >
    {/* <img tw="absolute w-full h-full" src={HeroBg} alt="hero background" /> */}
    {/* <MuhShapes /> */}
    <div tw="flex flex-col justify-center items-center z-10 absolute">
      <SloganText tw="inline-block text-4xl md:text-7xl mb-2 font-black">
        <h2 tw="inline-block text-white mr-2 md:mr-4">DeFi made</h2>
        <h2 tw="inline-block text-yearn-blue">simple</h2>
      </SloganText>
      <div tw="text-white font-bold md:text-3xl justify-center flex flex-col items-center mb-6 text-2xl">
        <HeaderText>
          Yearn puts your crypto assets to work so you don’t have to
        </HeaderText>
      </div>
      <Link
        type="button"
        tw="bg-yearn-blue px-6 rounded-lg py-1.5 flex justify-center items-center align-middle no-underline"
        to="/vaults"
      >
        <p tw="text-white uppercase text-base font-sans font-black no-underline">
          Go to Vaults
        </p>
      </Link>
    </div>
    <MarqueStats />
  </div>
);
