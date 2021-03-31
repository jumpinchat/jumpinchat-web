process.env.TZ = 'UTC';
module.exports = {
  verbose: false,
  testURL: 'http://localhost',
  setupFiles: [
    './setupTests.js',
    '<rootDir>/node_modules/regenerator-runtime/runtime',
    './shim.js',
  ],
  modulePaths: [
    './react-client',
  ],
  moduleDirectories: ['node_modules', 'react-client'],
  roots: [
    './react-client',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `${root}/__mocks__/fileMock.js`,
    '\\.(css|scss)$': 'identity-obj-proxy',
    'react-native': 'react-native-web',
  },
  transform: {
    '^.+\\.js': 'babel-jest',
  },
};
