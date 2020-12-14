import React from 'react';
import { Hero } from './Hero';
import { Products } from './Products';
import { Reviews } from './Reviews';
import { Security } from './Security';

export const SplashScreen = () => (
  <div className="flex flex-col space-y-16 bg-black">
    <Hero />
    <Products />
    <Security />
    <Reviews />
  </div>
);
