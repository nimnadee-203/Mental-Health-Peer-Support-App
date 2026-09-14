module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  moduleDirectories: ['node_modules', 'backend/node_modules'],
  moduleNameMapper: {
    '\\.(mp3|wav|ogg|m4a)$': '<rootDir>/__mocks__/fileMock.js',
  },
};


