const path = require('path');

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    '@fs-management/auth': {
      root: path.resolve(__dirname, '../packages/auth'),
    },
    '@fs-management/booking': {
      root: path.resolve(__dirname, '../packages/booking'),
    },
    '@fs-management/shared': {
      root: path.resolve(__dirname, '../packages/shared'),
    },
  },
};
