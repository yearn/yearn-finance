import React from 'react';
import tw, { styled } from 'twin.macro';
import FocusedDefi from '../../../images/focused-defi.png';
import YVaults from '../../../images/y-vaults.png';

const LearnMoreButton = styled.a(() => [
  tw`text-center text-white px-4 py-1 bg-yearn-blue lg:text-lg max-w-max rounded-md`,
]);

const RHSImageGovernance = ({
  headingText,
  secondHeadingText,
  descriptionText,
  secondDescriptionText,
  imageSrc,
  learnMoreHref,
}) => (
  <div tw="flex flex-col-reverse lg:flex-row space-x-0 lg:space-x-16">
    <div tw="flex flex-col space-y-4">
      <div tw="flex flex-col text-6xl text-white">
        <span tw="font-black">{headingText}</span>
        <span tw="uppercase text-3xl">{secondHeadingText}</span>
      </div>
      <span tw="font-bold text-xl">{descriptionText}</span>
      <span tw="font-bold text-xl">{secondDescriptionText}</span>
      <LearnMoreButton href={learnMoreHref}>Learn more</LearnMoreButton>
    </div>
    <img src={imageSrc} alt="yvaults" tw="mb-4 lg:mb-0 lg:w-5/12" />
  </div>
);

const LHSImageGovernance = ({
  headingText,
  secondHeadingText,
  descriptionText,
  secondDescriptionText,
  imageSrc,
  learnMoreText,
  learnMoreHref,
}) => (
  <div tw="flex flex-col lg:flex-row space-x-0 lg:space-x-16 space-y-4">
    <img src={imageSrc} alt="yvaults" tw="lg:w-5/12" />
    <div tw="flex flex-col mb-6 lg:mb-0 space-y-4">
      <div tw="flex flex-col text-6xl space-y-2 lg:-mt-4 text-white">
        <span tw="font-black">{headingText}</span>
        <span tw="uppercase text-3xl">{secondHeadingText}</span>
      </div>
      <span tw="font-bold text-xl">{descriptionText}</span>
      <span tw="font-bold text-xl">{secondDescriptionText}</span>
      <LearnMoreButton href={learnMoreHref}>{learnMoreText}</LearnMoreButton>
    </div>
  </div>
);

const LHSImageProduct = ({
  headingText,
  secondHeadingText,
  descriptionText,
  imageSrc,
  learnMoreHref,
}) => (
  <div tw="flex flex-col lg:flex-row space-x-0 lg:space-x-24 space-y-4">
    <img src={imageSrc} alt="yvaults" tw="lg:w-5/12" />
    <div tw="flex flex-col mb-6 lg:mb-0 space-y-4">
      <div tw="flex flex-col text-6xl space-y-2 lg:-mt-4">
        <span tw="font-black">{headingText}</span>
        <span tw="text-yearn-blue uppercase text-3xl">{secondHeadingText}</span>
      </div>
      <span tw="font-bold text-xl">{descriptionText}</span>
      <LearnMoreButton href={learnMoreHref}>Learn more</LearnMoreButton>
    </div>
  </div>
);

const RHSImageProduct = ({
  headingText,
  secondHeadingText,
  descriptionText,
  imageSrc,
  learnMoreHref,
}) => (
  <div tw="flex flex-col-reverse lg:flex-row space-x-0 lg:space-x-16">
    <div tw="flex flex-col space-y-4">
      <div tw="flex flex-col text-6xl space-y-2">
        <span tw="font-black">{headingText}</span>
        <span tw="text-yearn-blue uppercase text-3xl">{secondHeadingText}</span>
      </div>
      <span tw="font-bold text-xl">{descriptionText}</span>
      <LearnMoreButton href={learnMoreHref}>Learn more</LearnMoreButton>
    </div>
    <img src={imageSrc} alt="yvaults" tw="mb-4 lg:mb-0 lg:w-5/12" />
  </div>
);

const Products = () => (
  <div tw="flex flex-col space-y-24 text-white px-10 w-screen">
    <div tw="flex flex-col lg:flex-row lg:space-x-12">
      <div tw="flex flex-col mb-6 lg:mb-0">
        <div tw="inline-block font-black text-6xl mb-4">
          <span tw="inline-block float-left mr-2">Focused on</span>
          <span tw="inline-block float-left text-yearn-blue">innovation</span>
        </div>
        <span tw="font-bold text-xl">
          Yearn is creating next level financial products to scale human
          coordination on the internet. It’s a new frontier and we’re just
          getting started.
        </span>
      </div>
      <img src={FocusedDefi} alt="focused defi" tw="lg:w-7/12 w-full" />
    </div>
    <LHSImageProduct
      {...{
        headingText: 'yVaults',
        secondHeadingText: 'A level playing field',
        descriptionText:
          'Vaults are capital pools that generate yield with your assets. They give you the opportunity to invest your crypto in automated, yield-bearing strategies built by the best minds in DeFi.',
        imageSrc: YVaults,
        learnMoreHref: '/',
      }}
    />
    <RHSImageProduct
      {...{
        headingText: 'Cover',
        secondHeadingText: 'Smart contract insurance',
        descriptionText:
          'Purchase decentralized insurance coverage to protect against losses due to smart contract failure.',
        imageSrc: YVaults,
        learnMoreHref: '/',
      }}
    />
    <LHSImageProduct
      {...{
        headingText: 'yZap',
        secondHeadingText: 'Frictionless swaps',
        descriptionText:
          'Swap curve.finance tokens to receive stablecoins in return.',
        imageSrc: YVaults,
        learnMoreHref: '/',
      }}
    />
    <RHSImageProduct
      {...{
        headingText: 'yEarn',
        secondHeadingText: 'Earn up to 22% APY',
        descriptionText:
          'Earn is a yield optimizer that autonomously moves your funds between dYdX, Aave, and Compound. There is no minimum deposit and you can withdraw at any time.',
        imageSrc: YVaults,
        learnMoreHref: '/',
      }}
    />
    <LHSImageGovernance
      {...{
        headingText: 'Governance',
        secondHeadingText: 'Built by the community',
        descriptionText:
          'Decisions are made differently at Yearn. There’s no CEO. No managers.',
        secondDescriptionText:
          'Anyone may submit a proposal to improve the protocol. Ideas are approved based on merit, not seniority.',
        imageSrc: YVaults,
        learnMoreHref: '/',
        learnMoreText: 'Join our community',
      }}
    />
    <RHSImageGovernance
      {...{
        headingText: 'YFI',
        secondHeadingText: 'YFI Governance Token',
        descriptionText:
          "YFI token is the core of all Yearn’s decisions. It empowers the community to play the most important role in Yearn's ecosystem.",
        secondDescriptionText:
          'YFI was announced on July 17, 2020 in an effort to hand over control to the community. It had no pre-mine, no sale, and the supply was limited to 30,000 tokens that were earned by using the protocol.',
        imageSrc: YVaults,
        learnMoreHref: '/',
      }}
    />
  </div>
);
export { Products };
