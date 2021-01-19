import React from 'react';
import 'twin.macro';

import { LearnMoreCard } from '.';

export default {
  title: 'V2/LearnMoreCard',
  component: LearnMoreCard,
};

const Template = (args) => (
  <div tw="p-5 bg-black">
    <p tw="text-white mb-10">
      Clear local storage key and refresh if you close it :)
    </p>
    <LearnMoreCard {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  infoTitle: 'What are staking rewards?',
  infoDescription:
    'Earn passive income and participate in Yearn’s success. Through staking YFI in Yearn’s YFI vault you are entitled to a share of Yearn’s protocol earnings. Keep your YFI in the vault and let them grow your earnings as Yearn’s usage grows.',
  learnMoreText: 'Full Documentation',
  learnMoreHref: 'https://lmgtfy.com',
};
