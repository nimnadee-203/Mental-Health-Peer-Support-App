module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['server/**/*.js'],
      parserOptions: {
        requireConfigFile: false,
      },
    },
  ],
};
