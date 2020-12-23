import React from 'react';
import { css } from 'twin.macro';
import { Link } from 'react-router-dom';
import { MuhShapes } from './MuhShapes';
import { MarqueStats } from './MarqueeStats';

export const Hero = () => (
  <div
    tw="bg-black w-screen relative flex flex-col justify-center items-center overflow-hidden"
    css={[
      css`
        height: calc(100vh - 108px);
      `,
    ]}
  >
    {/* <img tw="absolute w-full z-0" src={HeroBg} alt="hero background" /> */}
    <MuhShapes />
    <div tw="flex flex-col justify-center items-center z-10 absolute">
      <div tw="inline-block text-4xl md:text-7xl mb-2 font-black">
        <h2 tw="inline-block text-white float-left mr-2 md:mr-4">DeFi made</h2>
        <h2 tw="inline-block text-yearn-blue float-left">simple.</h2>
      </div>
      <div tw="text-white font-bold md:text-4xl justify-center flex flex-col items-center mb-6 text-xl">
        <h4 tw="">Yearn finance is a gateway to DeFi products.</h4>
        <div tw="inline-block">
          <h4 tw="inline-block float-left">Simple</h4>
          <h4 tw="inline-block text-yearn-blue float-left mx-2">
            intuitive and decentralized
          </h4>
          <h4 tw="inline-block  float-left">solutions</h4>
        </div>
        <h4>accessible to anyone.</h4>
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
