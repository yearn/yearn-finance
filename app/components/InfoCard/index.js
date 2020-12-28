import Icon from 'components/Icon';
import React from 'react';
import { css } from 'twin.macro';

const InfoCard = ({
  infoTitle,
  infoDescription,
  learnMoreHref,
  learnMoreText,
}) => (
  <div tw="flex relative bg-white  rounded-md">
    <div tw="h-6 w-6 top-2 right-2 md:top-2 md:right-2 absolute cursor-pointer">
      <Icon type="close" />
    </div>
    <img
      tw="hidden sm:block"
      css={[
        css`
          max-width: 35vw;
          height: auto;
        `,
      ]}
      src="https://i.ibb.co/XpFgjhR/What-are-staking-rewards.png"
      alt="Info Shape"
    />
    <div tw="flex flex-col p-4 md:px-8">
      <h3 tw="font-sans font-bold text-2xl md:text-3xl mb-6">{infoTitle}</h3>
      <p tw="font-sans font-medium text-sm md:text-base mb-4">
        {infoDescription}
      </p>
      {learnMoreHref ? (
        <a
          tw="flex items-center space-x-2 font-sans font-medium text-sm md:text-base hover:text-yearn-blue"
          href={learnMoreHref}
        >
          <div tw="h-4 w-4">
            <Icon type="externalLinkBlack" />
          </div>
          <p tw="font-sans font-medium text-sm md:text-base">
            {learnMoreText || 'Learn more'}
          </p>
        </a>
      ) : null}
    </div>
  </div>
);

export { InfoCard };
