import 'twin.macro';
import React from 'react';
import { Hero } from './Hero';
// import { Products } from './Products';
// import { Reviews } from './Reviews';
// import { Security } from './Security';

export const SplashScreen = () => (
  <div tw="flex flex-col bg-black">
    <Hero />
    {/* TODO: Uncomment when designs are finalised :)  */}
    {/* <Products />
    <Security />
    <Reviews /> */}
  </div>
);
