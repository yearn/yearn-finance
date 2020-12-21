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
      <div tw="inline-block text-4xl md:text-6xl mb-3 font-black">
        <h2 tw="inline-block text-white float-left mr-2 md:mr-4">DeFi made</h2>
        <h2 tw="inline-block text-yearn-blue float-left">simple.</h2>
      </div>
      <div tw="text-white font-bold md:text-3xl justify-center flex flex-col items-center mb-5 text-xl">
        <div tw="inline-block flex justify-center flex-col items-center ">
          <h4 tw="inline-block float-left">
            Yearn puts your crypto assets to work for you,
          </h4>
          <div tw="flex space-x-2">
            <h4 tw="">responsibly earning</h4>
            <h4 tw="inline-block float-left text-yearn-blue">
              sustainable yields.
            </h4>
          </div>
        </div>
      </div>
      <Link
        type="button"
        tw="bg-yearn-blue px-6 rounded-lg py-2 flex justify-center items-center align-middle no-underline"
        to="/vaults"
      >
        <p tw="text-white uppercase text-lg font-sans no-underline">
          Go to Vaults
        </p>
      </Link>
    </div>
    <MarqueStats />
  </div>
);
