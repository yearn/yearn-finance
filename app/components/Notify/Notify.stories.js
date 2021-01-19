import React from 'react';

import { Notify } from '.';

export default {
  title: 'V2/Notify',
  component: Notify,
};

const Template = (args) => <Notify {...args} />;

export const Default = Template.bind({});

Default.args = {
  // NOTE - Can't add a link to the a notification object
  // NOTE - Cannot even use a React.Node in the message field..
  notificationObject: {
    eventCode: 'dbUpdate',
    type: 'pending',
    message: 'Updating the database with your information',
    // autoDismiss: 5000,
  },
};
