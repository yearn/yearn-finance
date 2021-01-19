const path = require('path');
module.exports = {
  stories: [
    '../app/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../app/containers/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config) => {
    config.resolve.modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, '..', 'app'),
      path.resolve(__dirname, '..', 'node_modules'),
    ];

    Object.assign(config, {
      node: {
        console: 'mock',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
      },
    });

    return config;
  },
};
