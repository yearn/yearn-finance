import 'twin.macro';
import React from 'react';
import { ForbesLogo } from './Logos/Forbes';
import { CoindeskLogo } from './Logos/Coindesk';
import { CoinTelegraphLogo } from './Logos/CoinTelegraph';

const getLogo = (logoName) => {
  if (logoName === 'Forbes') {
    return <ForbesLogo />;
  }
  if (logoName === 'Coindesk') {
    return <CoindeskLogo />;
  }
  if (logoName === 'CoinTelegraph') {
    return <CoinTelegraphLogo />;
  }
  return <ForbesLogo />;
};

const Review = ({ logoName, reviewText }) => {
  const logo = getLogo(logoName);

  return (
    <div tw="flex flex-col justify-center items-center">
      {logo}
      <span tw="mt-4 italic font-medium text-xl">{reviewText}</span>
    </div>
  );
};

export const Reviews = () => (
  <div tw="text-white w-full min-w-min flex flex-col justify-center items-center pb-24 space-y-12">
    {[
      {
        logoName: 'Forbes',
        reviewText:
          "How Ethereum's DeFi Darling YFI Reached $1 Billion In 2 Months",
      },
      {
        logoName: 'Coindesk',
        reviewText: 'The DeFi Gateway Everyone Is Talking About',
      },
      {
        logoName: 'CoinTelegraph',
        reviewText:
          "Analysts predict Yearn Finance's ETH vault could spark renewed Ether bull run",
      },
    ].map(Review)}
    <div>
      <a
        href="/reviews"
        tw="flex text-center justify-center items-center text-yearn-blue font-medium text-2xl"
      >
        All Articles
        <div tw="h-5 w-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </a>
    </div>
  </div>
);
