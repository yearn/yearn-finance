import React from 'react';

import { Navbar } from '.';

export default {
  title: 'V2/Navbar',
  component: Navbar,
};

const Template = (args) => <Navbar {...args} />;

export const Default = Template.bind({});
