module.exports = function babelConfig (api) {
  api.cache(true);
  const presets = [
    '@babel/preset-react',
    ['@babel/preset-env', {
      corejs: 3,
      useBuiltIns: 'usage',
      shippedProposals: true,
      targets: {
        esmodules: true,
      },
    }],
  ];
  const plugins = [
    ['transform-imports', {
      '@fortawesome/pro-regular-svg-icons': {
        transform: '@fortawesome/pro-regular-svg-icons/${member}',
        skipDefaultConversion: true,
        preventFullImport: true,
      },
      '@fortawesome/free-solid-svg-icons': {
        transform: '@fortawesome/free-solid-svg-icons/${member}',
        skipDefaultConversion: true,
        preventFullImport: true,
      },
      lodash: {
        transform: 'lodash/${member}',
        preventFullImport: true,
      },
    }],
  ];

  return {
    presets,
    plugins,
    sourceMaps: true,
  };
};
