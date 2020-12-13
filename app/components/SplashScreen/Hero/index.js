import React from 'react';
import { css } from 'twin.macro';
import HeroBg from '../../../images/hero-bg.png';

export const Hero = () => (
  <div
    className="bg-black w-screen relative flex flex-col justify-center items-center"
    css={[
      css`
        background: url(${HeroBg}) no-repeat center center fixed;
        background-size: cover;
        height: 450px;
        @media (min-width: 1024px) {
          height: 850px;
        }
      `,
    ]}
  >
    {/* <img className="absolute w-full z-0" src={HeroBg} alt="hero background" /> */}
    <div className="flex flex-col justify-center items-center ">
      <div className="inline-block text-4xl md:text-6xl mb-3 font-black">
        <h2 className="inline-block text-white float-left mr-2 md:mr-4">
          DeFi made
        </h2>
        <h2 className="inline-block text-yearn-blue float-left">simple.</h2>
      </div>
      <div className="text-white font-bold md:text-3xl justify-center flex flex-col items-center mb-5 text-xl">
        <h4 className="">Yearn finance is a gateway to DeFi products.</h4>
        <div className="inline-block">
          <h4 className="inline-block float-left">Simple</h4>
          <h4 className="inline-block text-yearn-blue float-left mx-2">
            intuitive and decentralized
          </h4>
          <h4 className="inline-block  float-left">solutions</h4>
        </div>
        <h4>accessible to anyone.</h4>
      </div>
      <button
        type="button"
        className="text-white bg-yearn-blue uppercase px-6 rounded-lg py-2"
      >
        Launch App
      </button>
    </div>
  </div>
);
