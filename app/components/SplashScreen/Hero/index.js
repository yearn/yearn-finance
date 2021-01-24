import React from 'react';
import { css } from 'twin.macro';
import { Link } from 'react-router-dom';
// import { MuhShapes } from './MuhShapes';
import { MarqueStats } from './MarqueeStats';
import HeroBg from '../../../images/Splash/hero-bg-svg.svg';

export const Hero = () => (
  <div
    tw="bg-black w-screen relative flex flex-col justify-center items-center overflow-hidden"
    css={[
      css`
        height: calc(100vh - 64px);
        background-image: url(${HeroBg});
        background-size: 100% 100%;
        @media (max-width: 1024px) {
          background: url(${HeroBg}) no-repeat center;
          background-size: 110%;
        }
        @media (max-width: 768px) {
          background: url(${HeroBg}) no-repeat center;
          background-size: 110%;
        }
        @media (max-width: 570px) {
          background: url(${HeroBg}) no-repeat center;
          background-size: 150%;
          margin-top: -78px;
          height: calc(100vh);
        }
        @media (max-width: 450px) {
          background: url(${HeroBg}) no-repeat center center;
          background-size: 60%;
        }
      `,
    ]}
  >
    {/* <img tw="absolute w-full h-full" src={HeroBg} alt="hero background" /> */}
    {/* <MuhShapes /> */}
    <div tw="flex flex-col justify-center items-center z-10 absolute">
      <div tw="inline-block text-4xl md:text-7xl mb-2 font-black">
        <h2 tw="inline-block text-white float-left mr-2 md:mr-4">DeFi made</h2>
        <h2 tw="inline-block text-yearn-blue float-left">simple.</h2>
      </div>
      <div tw="text-white font-bold md:text-3xl justify-center flex flex-col items-center mb-6 text-2xl">
        <h4 tw="">Yearn puts your crypto assets to</h4>
        <h4 tw="">work so you don’t have to.</h4>
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
