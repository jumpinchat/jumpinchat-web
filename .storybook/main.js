const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  stories: ['../react-client/js/**/*.stories.js'],
  addons: ['@storybook/addon-viewport/register'],
  webpackFinal: async (config, { configType  }) => {
     // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
     // You can change the configuration based on that.
     // 'PRODUCTION' is used when building the static version of storybook.

      // Make whatever fine-grained changes you need
      config.module.rules.push({
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        include: path.resolve(__dirname, '../react-client/styles'),
      });

      config.plugins.push(new MiniCssExtractPlugin({ filename: '[name].css'  }));

     return config;
   },
};
