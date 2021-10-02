const fs = require('fs');
const { ProgressPlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const root = fs.realpathSync(process.cwd());

const isProduction = () => process.env.NODE_ENV === 'production';

let optimization = {};
const plugins = [];

if (isProduction()) {
  optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          extractComments: 'all',
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  };
}

if (!isProduction()) {
  plugins.push(new ProgressPlugin());
}

module.exports = ({ esNext = true, watch }) => ({
  mode: isProduction() ? 'production' : 'development',
  devtool: isProduction() ? 'hidden-source-map' : 'inline-cheap-module-source-map',
  watch,
  entry: {
    bundle: [
      `${root}/react-client/js/app.js`,
    ],
  },
  output: {
    filename: `[name].${esNext ? 'mjs' : 'js'}`,
    path: `${root}/.tmp/js`,
  },
  optimization: {
    ...optimization,
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss'],
    modules: [
      `${root}/node_modules`,
    ],
  },
  module: {
    rules: [
      {
        enforce: 'post',
        test: /\.m?js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                corejs: 3,
                modules: false,
                useBuiltIns: 'usage',
                shippedProposals: true,
                targets: {
                  esmodules: esNext,
                },
              }],
              '@babel/preset-react',
            ],
          },
        },
      },
    ],
  },
  plugins,
});
