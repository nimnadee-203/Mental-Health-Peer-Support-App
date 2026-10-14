module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  moduleDirectories: ['node_modules', 'backend/node_modules'],
  moduleNameMapper: {
    '\\.(mp3|wav|ogg|m4a|png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/vectorIconsMock.js',
    '^@expo/vector-icons/(.*)$': '<rootDir>/__mocks__/vectorIconsMock.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 20000,
};


